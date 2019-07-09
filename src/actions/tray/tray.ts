import * as Hub from "../../hub"

export class TrayAction extends Hub.Action {

  name = "tray"
  label = "Tray"
  iconName = "tray/tray.svg"
  description = "Send data and begin a Tray workflow."
  domain = "trayapp.io"
  usesStreaming = true
  supportedFormats = [Hub.ActionFormat.JsonDetailLiteStream]
  params = []
  supportedActionTypes = [Hub.ActionType.Query]

  async execute(request: Hub.ActionRequest) {
    console.log(request)
    return new Hub.ActionResponse({success: true})
  }

  async form() {
    const form = new Hub.ActionForm()
    return form
  }
}

Hub.addAction(new TrayAction())
