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
		"orderCloseMessageKagitOperator/scripts/transactionCaller",
	],
	function(
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
		var SFC, OPERATION, SITE;
		return Controller.extend("orderCloseMessageKagitOperator.controller.Main", {
			onInit: function() {
				SITE = jQuery.sap.getUriParameters().get("SITE");
				SFC = jQuery.sap.getUriParameters().get("SFC");
				if (SFC == null || SFC == "") {
					MessageBox.error("Lütfen listeden işlem yapmak istediğiniz Sipariş Numarasını seçiniz");
					return;
				}
				this.getView().byId("orderField").setText("Sipariş Numarası: " + SFC);

				OPERATION = jQuery.sap.getUriParameters().get("OPERATION");
				if (OPERATION == null || OPERATION == "") {
					MessageBox.error("Lütfen listeden işlem yapmak istediğiniz Operasyon Numarasını seçiniz");
					return;
				}
				this.getView().byId("operationField").setText("Operasyon Numarası: " + OPERATION.slice(-4));
			},

			onConfirmPress: function onConfirmPress() {
				if (SFC == null || SFC == "") {
					MessageBox.error("Lütfen listeden işlem yapmak istediğiniz Sipariş Numarasını seçiniz");
					return;
				}

				if (OPERATION == null || OPERATION == "") {
					MessageBox.error("Lütfen listeden işlem yapmak istediğiniz Operasyon Numarasını seçiniz");
					return;
				}

				var response = TransactionCaller.sync("ECZ_MES-4.0/KAGIT/podButtons/orderClose/checkQualityForms/T_CHECK_QUALITY_FORMS", {
						I_SFC: SFC
					},
					"O_JSON"
				);

				if (response[1] == "E") {
					MessageBox.error(response[0]);
					return;
				}

				var statusCheck = TransactionCaller.sync("ECZ_MES-4.0/KAGIT/podButtons/orderClose/checkStatus/T_CHECK_STATUS", {
						I_SFC: SFC
					},
					"O_JSON"
				);

				if (statusCheck[1] === "E") {
					MessageBox.error(response[0]);
					return;
				}
				
				var response = TransactionCaller.sync("ECZ_MES-4.0/KAGIT/podButtons/orderClose/operatorClose/T_orderOparatorClose", {
						I_SFC: SFC,
						I_OPERATION: OPERATION,
						I_SITE: SITE,
					},
					"O_JSON"
				);

				if (response[1] == "E") {
					MessageBox.error(response[0]);
					return;
				} else {
					MessageBox.information(response[0]);
					window.parent.document.getElementById("templateForm:popupWindow-close").click();
				}

			},

			onCancelPress: function() {
				window.parent.document.getElementById("templateForm:popupWindow-close").click();
			}

		});
	}
);