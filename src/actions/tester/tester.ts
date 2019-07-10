import * as Hub from "../../hub"

export class TesterAction extends Hub.Action {

  requiredFields = []
  description = "Test the full response of an action"
  name = "tester"
  label = "Tester"
  params = []
  supportedActionTypes = [Hub.ActionType.Query]
  usesStreaming = true
  supportedFormattings = [Hub.ActionFormatting.Unformatted]
  supportedVisualizationFormattings = [Hub.ActionVisualizationFormatting.Noapply]
  supportedFormats = [Hub.ActionFormat.JsonDetail]

  async execute(request: Hub.ActionRequest) {
    console.log(request)
    try {
      // let columns = errors.map((e) => e.message ? e.message : e).join(", ")
      await request.streamJsonDetail({
        onFields: (fields) => {
          console.log(fields)
        },
        onRow: (row) => {
          console.log(row)
        },
      })
    } catch (e) {
    }
    return new Hub.ActionResponse({ success: true })
  }

  async form() {
    const form = new Hub.ActionForm()
    return form
  }
}
Hub.addAction(new TesterAction())
