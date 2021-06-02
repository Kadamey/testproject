sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"orderPriorityMove/scripts/transactionCaller",
	"sap/m/MessageToast"
], function(Controller, MessageBox, TransactionCaller, MessageToast) {
	"use strict";

	return Controller.extend("orderPriorityMove.controller.Main", {
		onInit: function() {
			this.orderInput = this.getView().byId("idInput");

			if (!jQuery.sap.getUriParameters().get("RESOURCE")) {
				MessageBox.error("Lütfen Operasyon Seçiniz..");
				this.orderInput.setEnabled(false);
				this.getView().byId("idButton").setEnabled(false);
				return;
			} else {
				//this.OPERATION = jQuery.sap.getUriParameters().get("OPERATION");
				this.SITE = jQuery.sap.getUriParameters().get("SITE");
				this.RESOURCE = jQuery.sap.getUriParameters().get("RESOURCE");
				this.SFC = jQuery.sap.getUriParameters().get("SFC");
				this.orderInput.setEnabled(true);
				this.getView().byId("idButton").setEnabled(true);
			}
		},

		onFormatInput: function() {
			this.orderInput.setValue(parseInt(this.orderInput.getValue()));
		},

		onPressSave: function() {
			TransactionCaller.async(
				"ECZ_MES-4.0/ORDERSEQ/T_UpdateSfcPriority", {
					I_SITE: this.SITE,
					I_SFC: this.SFC,
					I_RESOURCE: this.RESOURCE,
					I_NEW_ORDER_NO: parseInt(this.orderInput.getValue())
				},
				"O_JSON",
				this.saveNewOrderNoCB,
				this,
				"GET", {}
			);
		},

		saveNewOrderNoCB: function(iv_data, iv_scope) {
			var myModel = new sap.ui.model.json.JSONModel();

			if (Array.isArray(iv_data[0]?.Rowsets?.Rowset?.Row)) {
				myModel.setData(iv_data[0]);
			} else {
				var obj_iv_data = iv_data[0];
				var dummyData = [];
				dummyData.push(iv_data[0]?.Rowsets?.Rowset?.Row);
				obj_iv_data.Rowsets.Rowset.Row = dummyData;
				myModel.setData(obj_iv_data);
			}

			if (iv_data[1] === "S") {
				MessageToast.show(myModel.getData().Rowsets.Rowset.Row[0], {
					duration: 5000,
					at: "center bottom"
				});
				iv_scope.orderInput.setValue("");
			}

		}

	});
});