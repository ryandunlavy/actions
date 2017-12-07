import * as D from "../../framework"

const airtable: any = require("airtable")

export class AirtableAction extends D.Action {

  constructor() {
    super()

    this.name = "airtable"
    this.label = "Airtable"
    this.iconName = "airtable/airtable.png"
    this.description = "Add records to an Airtable table."
    this.params = [
      {
        description: "API key for Airtable from https://airtable.com/account.",
        label: "Airtable API Key",
        name: "airtable_api_key",
        required: true,
        sensitive: true,
      },
    ]
    this.supportedActionTypes = [D.ActionType.Query]
    this.supportedFormats = [D.ActionFormat.JsonDetail]
    this.supportedFormattings = [D.ActionFormatting.Unformatted]
    this.supportedVisualizationFormattings = [D.ActionVisualizationFormatting.Noapply]
  }

  async execute(request: D.ActionRequest) {
    return new Promise<D.ActionResponse>((resolve, reject) => {

      if (!(request.attachment && request.attachment.dataJSON)) {
        reject("No attached json.")
        return
      }

      if (!(request.formParams.base && request.formParams.table)) {
        reject("Missing Airtable base or table.")
        return
      }

      const qr = request.attachment.dataJSON
      if (!qr.fields || !qr.data) {
        reject("Request payload is an invalid format.")
        return
      }

      const fields: any[] = [].concat(...Object.keys(qr.fields).map((k) => qr.fields[k]))
      const fieldMap: any = {}
      for (const field of fields) {
        fieldMap[field.name] = field.label_short || field.label || field.name
      }

      const airtableClient = this.airtableClientFromRequest(request)
      const table = airtableClient.base(request.formParams.base)(request.formParams.table)

      const errors: {message: string}[] = []
      for (const row of qr.data) {
        // transform row to {label short: value, }
        const record: any = {}
        for (const field of fields) {
          record[fieldMap[field.name]] = row[field.name].value
        }
        table.create(record, (err: {message: string}) => {
          if (err) {
            errors.push(err)
          }
        })
      }

      let response
      if (errors) {
        response = {
          success: false,
          message: errors.map((e) => e.message).join(", "),
        }
      }
      resolve(new D.ActionResponse(response))

    })
  }

  async form() {
    return new Promise<D.ActionForm>((resolve) => {

      const form = new D.ActionForm()
      form.fields = [{
        label: "Airtable Base",
        name: "base",
        required: true,
        type: "string",
      }, {
        label: "Airtable Table",
        name: "table",
        required: true,
        type: "string",
      }]
      resolve(form)
    })
  }

  private airtableClientFromRequest(request: D.ActionRequest) {
    return new airtable({apiKey: request.params.airtable_api_key})
  }

}

D.addAction(new AirtableAction())