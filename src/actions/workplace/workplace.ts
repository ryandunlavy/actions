import * as Hub from "../../hub"

const FB = require("fb")

export interface Destination {
  id: string,
  label: string,
}

export class WorkplaceAction extends Hub.Action {

  constructor() {
    super()
    this.name = "workplace-facebook"
    this.label = "Workplace by Facebook"
    this.iconName = "facebook/workplace-facebook.svg"
    this.description = "Write a message to Workplace by Facebook."
    this.supportedActionTypes = [Hub.ActionType.Query, Hub.ActionType.Dashboard]
    this.params = [
      {
        name: "facebook_app_access_token",
        label: "Facebook App Access Token",
        required: true,
        description:
          "https://developers.facebook.com/docs/workplace/integrations/custom-integrations/reference#appaccesstoken",
        sensitive: true,
      },
    ]
  }

  async execute(request: Hub.ActionRequest) {
    if (!request.attachment || !request.attachment.dataBuffer) {
      throw "Couldn't get data from attachment."
    }

    if (!request.formParams || !request.formParams.destination) {
      throw "Missing destination."
    }

    const fb = this.facebookClientFromRequest(request)
    const message = request.formParams.message || request.scheduledPlan!.title!
    const link = request.scheduledPlan && request.scheduledPlan.url
    const qs = {
      message,
      link,
    }

    const resp = await fb.api(`/${encodeURIComponent(request.formParams.destination!)}/feed`, "post", qs)
    let response
    if (!resp || resp.error) {
      response = {success: false, message: resp ? resp.error : "Error Occurred"}
    }

    return new Hub.ActionResponse(response)
  }

  async form(request: Hub.ActionRequest) {
    const form = new Hub.ActionForm()

    const destinations = await this.usableDestinations(request)
    form.fields = [{
      description: "Name of the Facebook group you would like to post to.",
      label: "Share In",
      name: "destination",
      options: destinations.map((destination) => ({name: destination.id, label: destination.label})),
      required: true,
      type: "select",
    }, {
      label: "Message",
      type: "string",
      name: "message",
    }]

    return form
  }

  private async usableDestinations(request: Hub.ActionRequest): Promise<Destination[]> {
    const fb = this.facebookClientFromRequest(request)
    const response = await fb.api("/community")
    if (!(response && response.id)) {
      throw "No communnity."
    }
    const [groups, members] = await Promise.all([
      this.usableGroups(fb, response.id),
      this.usableMembers(fb, response.id),
    ])
    return groups.concat(members)
  }

  private async usableGroups(fb: any, community: string) {
    const response = await fb.api(`/${encodeURIComponent(community)}/groups`)
    const groups = response.data.filter((g: any) => g.privacy ? g.privacy !== "CLOSED" : true)
    return groups.map((g: any) => ({id: g.id, label: `#${g.name}`}))
  }

  private async usableMembers(fb: any, community: string) {
    const response = await fb.api(`/${encodeURIComponent(community)}/members`)
    return response.data.map((m: any) => ({id: m.id, label: `@${m.name}`}))
  }

  private facebookClientFromRequest(request: Hub.ActionRequest) {
    const options = {
      accessToken: request.params.facebook_app_access_token,
    }
    return new FB.Facebook(options)
  }

}

Hub.addAction(new WorkplaceAction())