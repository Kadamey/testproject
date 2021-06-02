sap.ui.define(
	[
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"sap/ui/core/Fragment",
		"sap/m/MessageBox",
		"sap/m/Dialog",
		"sap/m/DialogType",
		"sap/m/Button",
		"sap/m/ButtonType",
		"millGrouping/scripts/transactionCaller",
	],
	function (
		Controller,
		JSONModel,
		MessageToast,
		Fragment,
		MessageBox,
		Dialog,
		DialogType,
		Button,
		ButtonType,
		TransactionCaller
	) {
		"use strict";
		//var that, sPath, line, unit;
		var myModel;
		return Controller.extend("millGrouping.controller.Main", {
			onInit: function () {
				this.getBobbinDetails();
			},

			getBobbinDetails: function () {
				var response = TransactionCaller.async("ECZ_MES-4.0/LGV/MILL_GRUPLAMA/T_GetBobbinDetails", {},
					"O_JSON",
					this.getBobbinDetailsCB,
					this,
					"GET"
				);
			},

			getBobbinDetailsCB: function (iv_data, iv_scope) {
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
				myModel.setSizeLimit(10000);
				
				iv_scope.getView().byId("idMillBobbinTable").setModel(myModel);
				iv_scope.getView().byId("idMillBobbinTable").getModel().refresh();
			},

			onSelectFromTable: function () {
				var contexts = this.getView()
					.byId("idMillBobbinTable")
					.getSelectedContexts();
				var selectedItems = contexts.map(function (c) {
					return c.getObject();
				});
				if (
					this.getView()
					.byId("idMillBobbinTable")
					.getSelectedItems()[selectedItems.length - 1].getAggregation("cells")[6]
					.getLastValue() === ""
				) {
					this.getView()
						.byId("idMillBobbinTable")
						.removeSelections(selectedItems.length - 1);
					MessageBox.error("Durum Alanı Boş Bırakılamaz!");
				} else {
					selectedItems[
							selectedItems.length - 1
						].comboBoxValue = this.getView()
						.byId("idMillBobbinTable")
						.getSelectedItems()[selectedItems.length - 1].getAggregation("cells")[6]
						.getLastValue();

					for (
						var i = 0; i <
						this.getView().byId("idMillBobbinTable").getModel().getData()
						.Rowsets.Rowset.Row.length; i++
					) {
						if (
							this.getView().byId("idMillBobbinTable").getModel().getData()
							.Rowsets.Rowset.Row[i + 1].comboBoxValue
						) {
							if (
								selectedItems[i + 1].comboBoxValue ===
								this.getView()
								.byId("idMillBobbinTable")
								.getSelectedItems()[i].getAggregation("cells")[6]
								.getLastValue()
							) {
								this.getView()
									.byId("idMillBobbinTable")
									.removeSelections(selectedItems.length - 1);

								MessageBox.error("Aynı Durum Seçilemez!");
							}
						}
					}
				}
			},

			ResourceBundle: function (iv_id) {
				var oBundle = this.getView().getModel("i18n").getResourceBundle();
				var txt = oBundle.getText(iv_id);
				return txt;
			},

			onPressSaveButton: function (oEvent) {
				var jsonData = [];
				var selectedContextPath = this.getView()
					.byId("idMillBobbinTable")
					.getSelectedContextPaths("rows");
				if (selectedContextPath.length != 2) {
					MessageBox.error("2 satır seçiniz!");
				}
				var selectedLine = this.getView()
					.byId("idMillBobbinTable")
					.getModel()
					.getObject(selectedContextPath[0]);
				var selectedLine2 = this.getView()
					.byId("idMillBobbinTable")
					.getModel()
					.getObject(selectedContextPath[1]);
				var comboBoxValue1 = selectedLine.comboBoxValue;
				var comboBoxValue2 = selectedLine2.comboBoxValue;

				if (comboBoxValue1 == comboBoxValue2) {
					MessageBox.error("Aynı Durum Seçilemez");
				}

				/*
			      this.getView().byId("idBobbinTable").getSelectedContextPaths().forEach((item, index) => {
			          jsonData.push(this.getView().byId("idBobbinTable").getModel().getData(0).Rowsets.Rowset.Row[item.substr(item.lastIndexOf("/") + 1)]);
			      }, this);
			      */
				jsonData.push(selectedLine, selectedLine2);

				var response = TransactionCaller.sync(
					"ECZ_MES-4.0/LGV/MILL_GRUPLAMA/T_GroupNowithBobbinID", {
						I_jsonData: JSON.stringify(jsonData),
					},
					"O_JSON"
				);

				if (response[1] == "E") {
					MessageBox.show("Hata mesaji: " + response[0]);
				} else {
					var Msg = "Başarılı";
					MessageToast.show(Msg);
					this.getBobbinDetails();
				}
			},
		});
	}
);