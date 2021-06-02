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
		"addShortLineCharge/scripts/transactionCaller",
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
		var myModel, SFC, RESOURCE, total;
		return Controller.extend("addShortLineCharge.controller.Main", {
			onInit: function () {
				RESOURCE = jQuery.sap.getUriParameters().get("RESOURCE");
				SFC = jQuery.sap.getUriParameters().get("SFC");
				this.getInitialDatas();
			},

			getInitialDatas: function () {
				TransactionCaller.async(
					"ECZ_MES-4.0/SELULOZ/longLineChargeScreen/T_GetLongLineCharge", {
						I_SFC: SFC,
						I_TYPE: "Kısa",
					},
					"O_JSON",
					this.getInitialDatasCB,
					this,
					"GET"
				);
			},

			getInitialDatasCB: function (iv_data, iv_scope) {
				myModel = new sap.ui.model.json.JSONModel();
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
				iv_scope.getView().byId("idShortTable").setModel(myModel);
				iv_scope.getView().byId("idShortTable").getModel().refresh();
				iv_scope.getTotal();
				iv_scope.getView().byId("sumValue").setText(total);
			},
			onPressSaveButton: function (oEvent) {
				var response = TransactionCaller.sync("ECZ_MES-4.0/SELULOZ/readSfc_test", {
						I_SFC: SFC,
					},
					"O_JSON"
				);
				if (response[1] == "E") {
					MessageBox.error(response[0]);
					window.parent.document.getElementById("templateForm:popupWindow-close").click();
					return;
				} else {
					var jsonData = JSON.stringify(
						this.oView.byId("idShortTable").getModel().getData().Rowsets.Rowset
						.Row
					);
					var response = TransactionCaller.sync(
						"ECZ_MES-4.0/SELULOZ/longLineChargeScreen/T_SaveButton", {
							I_jsonData: jsonData,
							I_SFC: SFC,
							I_RESOURCE: RESOURCE,
						},
						"O_JSON"
					);
					MessageBox.show(response[0]);
				}
				window.parent.document.getElementById("templateForm:popupWindow-close").click();
			},

			onEdit: function () {
				this.byId("editButton").setVisible(false);
				this.byId("saveButton").setVisible(true);
				this.byId("cancelButton").setVisible(true);
				this.byId("deleteButton").setVisible(true);
				this.byId("editKolon1").setVisible(true);
				this.byId("editKolon2").setVisible(true);
				this.byId("editKolon3").setVisible(true);
				this.byId("visibleKolon1").setVisible(false);
				this.byId("visibleKolon2").setVisible(false);
				this.byId("visibleKolon3").setVisible(false);
			},

			getTotal: function () {
				total = 0;
				var myModel = this.getView().byId("idShortTable").getModel();

				for (var i = 0; i < myModel.getData()?.Rowsets?.Rowset?.Row?.length; i++) {
					total += Number(myModel.getData()?.Rowsets?.Rowset?.Row[i]?.ADET);
				}
			},

			onSave: function () {
				var errorState = false;
				this.getView().byId("idShortTable").getModel().getData().Rowsets.Rowset.Row.forEach((item) => {
					if (Number(item.ADET) <= 0) {
						errorState = true;
					}
				}, this)

				if (errorState) {
					MessageBox.error("Girilen adet miktarı 0'dan küçük olamaz");
					return;
				}
				this.getTotal();

				if (total > 20) {
					MessageBox.error("Toplam balya adedi '20' sınırını aşmıştır");
					this.byId("cancelButton").setEnabled(false);
					return;
				} else {
					this.byId("cancelButton").setEnabled(true);
					this.byId("saveButton").setVisible(false);
					this.byId("cancelButton").setVisible(false);
					this.byId("deleteButton").setVisible(false);
					this.byId("editButton").setVisible(true);
					this.byId("editKolon1").setVisible(false);
					this.byId("editKolon2").setVisible(false);
					this.byId("editKolon3").setVisible(false);
					this.byId("visibleKolon1").setVisible(true);
					this.byId("visibleKolon2").setVisible(true);
					this.byId("visibleKolon3").setVisible(true);

					this.getView().byId("sumValue").setText(total);
					myModel.refresh();
					this.getView().byId("idShortTable").setModel(myModel);
				}
			},

			onCancel: function () {
				this.byId("cancelButton").setVisible(false);
				this.byId("saveButton").setVisible(false);
				this.byId("editButton").setVisible(true);
				this.byId("deleteButton").setVisible(false);
				this.byId("editKolon1").setVisible(false);
				this.byId("editKolon2").setVisible(false);
				this.byId("editKolon3").setVisible(false);
				this.byId("visibleKolon1").setVisible(true);
				this.byId("visibleKolon2").setVisible(true);
				this.byId("visibleKolon3").setVisible(true);
			},
			onPressAddSelulozButton: function (oEvent) {
				if (sap.ui.core.Fragment.byId("Z_SelulozAddFragment", "quantity").getValue() == 0 || sap.ui.core.Fragment.byId("Z_SelulozAddFragment", "quantity").getValue() == "" || sap.ui.core.Fragment.byId("Z_SelulozAddFragment", "idMaterialCombobox").getSelectedKey() == "") {
					MessageBox.error("Lütfen malzeme ve miktar alanlarına geçerli girişler yapınız!");
					sap.ui.core.Fragment.byId("Z_SelulozAddFragment", "onPressAddSelulozButton").setEnabled(false);
					return;
				} else {
					var material = sap.ui.core.Fragment.byId(
						"Z_SelulozAddFragment",
						"idMaterialCombobox"
					).getSelectedKey();
					var weight = sap.ui.core.Fragment.byId(
							"Z_SelulozAddFragment",
							"idMaterialCombobox"
						)
						.getModel()
						.getData()
						.Rowsets.Rowset.Row.find((o) => o.ITEM == material).WEIGHT;
					var quantity = sap.ui.core.Fragment.byId(
						"Z_SelulozAddFragment",
						"quantity"
					).getValue();

					var type = "Kısa";
					var allData = {
						Rowsets: {
							Rowset: {
								Row: []
							}
						}
					};

					this.getView()
						.byId("idShortTable")
						.getModel()?.getData()?.Rowsets.Rowset.Row.forEach((input, index) => {
							allData.Rowsets.Rowset.Row[index] = input;
						});

					var jsonDataforInputs2 = [];
					jsonDataforInputs2.push({
						MARKA: material,
						ADET: quantity,
						TYPE: type,
						WEIGHT: weight,
						WEIGHT1: weight,
					});

					allData.Rowsets.Rowset.Row[allData.Rowsets.Rowset.Row.length] =
						jsonDataforInputs2[0];
                 //var myModel = this.getView().byId("idShortTable").getModel();
					myModel.setData(allData);
					this.getView().byId("idShortTable").setModel(myModel);
					this.getTotal();

					if (total > 20) {
						MessageBox.error("Toplam balya adedi '20' sınırını aşmıştır");
						this.byId("cancelButton").setEnabled(false);
						allData.Rowsets.Rowset.Row.pop();
						myModel.setData(allData);
						this.getView().byId("idShortTable").setModel(myModel);
						return;
					} else {
						this.getView().byId("sumValue").setText(total);
						this._oDialogSelulozAdd.close();
					}
				}
			},
			getAllMaterials: function () {
				TransactionCaller.async(
					"ECZ_MES-4.0/KAGIT/selulozCombinationScreen/T_GetMaterialsBelongsToSeluloz", {
						I_TYPE: "Kısa"
					},
					"O_JSON",
					this.getAllMaterialsCB,
					this,
					"GET", {}
				);
			},
			getAllMaterialsCB: function (iv_data, iv_scope) {
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

				sap.ui.core.Fragment.byId(
					"Z_SelulozAddFragment",
					"idMaterialCombobox"
				).setModel(myModel);
			},
			onPressSelulozAddButton: function () {
				if (!this._oDialogSelulozAdd) {
					this._oDialogSelulozAdd = sap.ui.xmlfragment(
						"Z_SelulozAddFragment",
						"addShortLineCharge.view.fragments.addSeluloz",
						this
					);

					this.getView().addDependent(this._oDialogSelulozAdd);
				}

				this._oDialogSelulozAdd.open();
				this.getAllMaterials();
			},
			onConfirmSelulozAddButton: function (oEvent) {
				var material = sap.ui.core.Fragment.byId(
					"Z_SelulozAddFragment",
					"idMaterialCombobox"
				).getSelectedKey();
				var weight = sap.ui.core.Fragment.byId(
						"Z_SelulozAddFragment",
						"idMaterialCombobox"
					)
					.getModel()
					.getData()
					.Rowsets.Rowset.Row.find((o) => o.ITEM == material).WEIGHT;

				var quantity = sap.ui.core.Fragment.byId(
					"Z_SelulozAddFragment",
					"quantity"
				).getValue();

				var existingTableDataSeluloz = [];

				sap.ui.core.Fragment.byId("Z_SelulozAddFragment", "idSelulozAddTable")
					.getModel()?.getData()?.forEach((input, index) => {
						existingTableDataSeluloz[index] = input;
					});

				var jsonDataforInputs = [];
				jsonDataforInputs.push({
					MATERIAL: material,
					QUANTITY: quantity,

					WEIGHT: weight * quantity,
				});

				existingTableDataSeluloz[existingTableDataSeluloz.length] =
					jsonDataforInputs[0];
				var oModel = new sap.ui.model.json.JSONModel();

				oModel.setData(existingTableDataSeluloz);
				sap.ui.core.Fragment.byId(
					"Z_SelulozAddFragment",
					"idShortTable"
				).setModel(oModel);
			},
			onCancelSelulozButton: function () {
				this._oDialogSelulozAdd.close();
			},
			onDelete: function () {

				var oTable = this.getView().byId("idShortTable");
				var oModel2 = oTable.getModel();
				var aRows = oModel2.getData().Rowsets.Rowset.Row;
				var aContexts = oTable.getSelectedContexts();

				for (var i = aContexts.length - 1; i >= 0; i--) {
					var oThisObj = aContexts[i].getObject();
					var index = $.map(aRows, function (obj, index) {

						if (obj === oThisObj) {
							return index;
						}
					});

					aRows.splice(index, 1);
				}

				var allData = {
					Rowsets: {
						Rowset: {
							Row: []
						}
					}
				};

				aRows.forEach((input, index) => {
					allData.Rowsets.Rowset.Row[index] = input;
				});

				oModel2.setData(allData);
				oModel2.refresh();
				oTable.setModel(oModel2);
				oTable.getModel().refresh();
			}
		});
	}
);