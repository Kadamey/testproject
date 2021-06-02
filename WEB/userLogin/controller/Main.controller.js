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
		"userLogin/scripts/transactionCaller",
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
		var that,
			sPath,
			myModel,
			dummyModel

		return Controller.extend("userLogin.controller.Main", {
			onInit: function () {
				this.SITE = jQuery.sap.getUriParameters().get("SITE");
				var Resource = jQuery.sap.getUriParameters().get("RESOURCE");

				if (Resource == "" || Resource == null) {
					MessageBox.error("Lütfen iş yeri seçiniz..");
					return;
				} else {
					var parts = Resource.split('_');
					this.WorkCenter = parts[parts.length - 1];
				}

				this.getFırstOperatorUserID();
				this.getSecondOperatorUserID();
				this.getThirdOperatorUserID();
			},

			getFırstOperatorUserID: function () {
				TransactionCaller.async("ECZ_MES-4.0/KAGIT/USER_LOGIN/setFirstOperator", {
						I_PLANT: this.SITE
					},
					"O_JSON",
					this.getFırstOperatorUserIDCB,
					this,
					"GET", {}
				);
			},
			getFırstOperatorUserIDCB: function (iv_data, iv_scope) {
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
				iv_scope.getView().byId("idFirstOperator").setModel(myModel);
			},

			getSecondOperatorUserID: function () {
				TransactionCaller.async("ECZ_MES-4.0/KAGIT/USER_LOGIN/setSecondOperator", {
						I_PLANT: this.SITE
					},
					"O_JSON",
					this.getSecondOperatorUserIDCB,
					this,
					"GET", {}
				);
			},
			getSecondOperatorUserIDCB: function (iv_data, iv_scope) {
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

				iv_scope.getView().byId("idSecondOperator").setModel(myModel);
			},

			getThirdOperatorUserID: function () {
				TransactionCaller.async("ECZ_MES-4.0/KAGIT/USER_LOGIN/setThirdOperator", {
						I_PLANT: this.SITE
					},
					"O_JSON",
					this.getThirdOperatorUserIDCB,
					this,
					"GET", {}
				);
			},
			getThirdOperatorUserIDCB: function (iv_data, iv_scope) {
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

				iv_scope.getView().byId("idShiftTec").setModel(myModel);
			},

			onPressSave: function () {
				if (this.WorkCenter == "" || this.WorkCenter == null) {
					MessageBox.error("İş yeri seçmeden işlem yapamazsınız.");
					return;
				} else {
					var userGroup1 = this.getView().byId("idFirstOperator").getSelectedKey();
					var userName1 = this.getView().byId("idFirstOperator")._getSelectedItemText();
					var userGroup2 = this.getView().byId("idSecondOperator").getSelectedKey();
					var userName2 = this.getView().byId("idSecondOperator")._getSelectedItemText();
					var userGroup3 = this.getView().byId("idShiftTec").getSelectedKey();
					var userName3 = this.getView().byId("idShiftTec")._getSelectedItemText();
					var desc = this.getView().byId("idDesc").getValue();

					if (userGroup1 == "" || userName1 == "" || userGroup2 == "" || userName2 == "" || userGroup3 == "" || userName3 == "") {
						MessageToast.show("Lütfen tüm zorunlu alanları doldurunuz!");
						return;
					} else {

						var response = TransactionCaller.sync("ECZ_MES-4.0/KAGIT/USER_LOGIN/T_insUserLogin", {
								I_FIRSTOP: userName1,
								I_FIRSTUSERGROUP: userGroup1,
								I_SECONDOP: userName2,
								I_SECUSERGROUP: userGroup2,
								I_TECHNICIAN: userName3,
								I_TECHNICIANGROUP: userGroup3,
								I_DESC: desc,
								I_WRKCNTR: this.WorkCenter
							},
							"O_JSON"
						);

						if (response[1] == "E") {
							MessageBox.error("Hata mesaji: " + response[0]);
						} else {
							MessageToast.show(response[0]);
							var labelIds = ["idFirstOperator", "idSecondOperator", "idShiftTec"];
							labelIds.forEach((item) => {
								this.getView().byId(item).setSelectedKey();
							}, this);

							this.getView().byId("idDesc").setValue("");
						}
					}
				}
			}
		});
	}
);