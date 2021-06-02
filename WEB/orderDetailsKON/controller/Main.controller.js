sap.ui.define(
	[
		"jquery.sap.global",
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/core/Fragment",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/export/library",
		"sap/ui/export/Spreadsheet",
		"orderDetailsKON/scripts/transactionCaller",
		"sap/m/Dialog",
		"sap/m/Text",
		"sap/m/TextArea",
		"sap/m/Button",
		"sap/m/DialogType",
		"sap/m/ButtonType",
		"sap/m/PDFViewer",
	],
	function (
		jQuery,
		Controller,
		JSONModel,
		MessageToast,
		MessageBox,
		Fragment,
		Filter,
		FilterOperator,
		exportLibrary,
		Spreadsheet,
		TransactionCaller,
		Dialog,
		Text,
		TextArea,
		Button,
		DialogType,
		ButtonType,
		PDFViewer,
	) {
		"use strict";
		var that, sPath, line, unit, SFC, OPERATION;
		return Controller.extend("orderDetailsKON.controller.Main", {
			onInit: function () {
				this._pdfViewer = new PDFViewer();
				this.getView().addDependent(this._pdfViewer);

				SFC = jQuery.sap.getUriParameters().get("SFC");
				OPERATION = jQuery.sap.getUriParameters().get("OPERATION");

				this.getOrderDetails();
			},

			getOrderDetails: function () {
				TransactionCaller.async(
					"ECZ_MES-4.0/KONVERTING/orderDetailKon/setOrderDetails", {
						I_SFC: SFC,
					},
					"O_JSON",
					this.getOrderDetailsCB,
					this,
					"GET"
				);
			},
			getOrderDetailsCB: function (iv_data, iv_scope) {
				var myModel = new sap.ui.model.json.JSONModel();
				if (Array.isArray(iv_data[0].Rowsets?.Rowset?.Row)) {
					myModel.setData(iv_data[0]);
				} else if (!iv_data[0].Rowsets?.Rowset?.Row) {
					myModel.setData(null);
				} else {
					var obj_iv_data = iv_data[0];
					var dummyData = [];
					dummyData.push(iv_data[0].Rowsets.Rowset.Row);
					obj_iv_data.Rowsets.Rowset.Row = dummyData;
					myModel.setData(obj_iv_data);
				}

				iv_scope.getView().byId("idOrderDetailTable").setModel(myModel);
				iv_scope.getView().byId("idOrderDetailTable").getModel().refresh();
			},

			getBarcodePDFView: function (oEvent) {
				var selectedIndex = oEvent.oSource.getParent().getBindingContext().getPath().split("/")[4];
				var oTableData = this.getView().byId("idOrderDetailTable").getModel().getData().Rowsets.Rowset.Row;
				var selectedLine = oTableData[selectedIndex];

				TransactionCaller.async(
					"ECZ_MES-4.0/PRINTING/T_Paletetiket", {
						I_MATERIAL: selectedLine.ITEM_BO,
						I_BATCH: selectedLine.INVENTORY_ID,
					},
					"O_JSON",
					this.getBarcodePDFViewCB,
					this,
					"GET"
				);

			},

			getBarcodePDFViewCB: function (iv_data, iv_scope) {
				var base64EncodedPDF = iv_data[0].Result.value; // the encoded string
				var decodedPdfContent = atob(base64EncodedPDF);
				var byteArray = new Uint8Array(decodedPdfContent.length)
				for (var i = 0; i < decodedPdfContent.length; i++) {
					byteArray[i] = decodedPdfContent.charCodeAt(i);
				}
				var blob = new Blob([byteArray.buffer], {
					type: 'application/pdf'
				});
				var _pdfurl = URL.createObjectURL(blob);
				jQuery.sap.addUrlWhitelist("blob");

				iv_scope._pdfViewer.setSource(_pdfurl);
				iv_scope._pdfViewer.setTitle("Çubuk Barkod");
				iv_scope._pdfViewer.open();
			},

			ResourceBundle: function (iv_id) {
				var oBundle = this.getView().getModel("i18n").getResourceBundle();
				var txt = oBundle.getText(iv_id);
				return txt;
			},
		});
	}
);