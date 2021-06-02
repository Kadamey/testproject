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
		"selulozOperationStartConfirmMessage/scripts/transactionCaller",
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
		TransactionCaller
	) {
		"use strict";
		var that, sPath, myModel, tableModel, SFC;
		let frgData;
		return Controller.extend("selulozOperationStartConfirmMessage.controller.Main", {
			onInit: function () {
				//this.getAllLines();
				// this.setDummyData();

				SFC = jQuery.sap.getUriParameters().get("SFC");
		

			},

			
		
onConfirmPress: function onConfirmPress() {



    window.parent.document.getElementById("templateForm:popupWindow-close").click();

      

    },

onCancelPress: function () {


    window.parent.document.getElementById("templateForm:popupWindow-close").click();
    },

		});
	}
);
