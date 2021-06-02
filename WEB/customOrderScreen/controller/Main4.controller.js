sap.ui.define(
	[
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		'sap/m/MessageBox',
		"sap/m/Dialog",
		"sap/m/DialogType",
		"sap/m/Button",
		"sap/m/ButtonType",
		'customOrderScreen/scripts/transactionCaller'
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
		var BATCH, HANDLE, ROW_NUMBER, SAMPLE_TIME, oRouter, OPERATION, selectedParentSfc, selectedWorkCenter, selectedOrderStatu, PLANT;

		return Controller.extend("customOrderScreen.controller.Main4", {
			onInit: function () {
				oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.getRoute("RouteMain4").attachPatternMatched(this._onRoute, this);
			},

			_onRoute: function (oEvent) {
				var myModel = new sap.ui.model.json.JSONModel();
				myModel.setData(null);
				this.getView().byId("idQualityResultTable").setModel(myModel);

				BATCH = oEvent.getParameter("arguments").batchNo;
				OPERATION = oEvent.getParameter("arguments").operationNo;
				selectedParentSfc = oEvent.getParameter("arguments").selectedParentSfc;
				selectedWorkCenter = oEvent.getParameter("arguments").selectedWorkCenter;
				selectedOrderStatu = oEvent.getParameter("arguments").selectedOrderStatu;
				PLANT = oEvent.getParameter("arguments").PLANT;
				
				this.getView().byId("batchValue").setText("Parti Numarası : " + BATCH);
				this.openLogFragment();
			},

			//Sayfa ilk açıldığında kontrol listesinin daha önce kaydının olup olmadığını kontrol eden kısım
			openLogFragment: function () {
				if (BATCH == null || BATCH == "") {
					MessageBox.error("Sistemde ilgili Parti Numarası bulunamadı");
					return;
				}

				if (OPERATION == null || OPERATION == "") {
					MessageBox.error("Lütfen listeden işlem yapmak istediğiniz Operasyon Numarasını seçiniz");
					return;
				}

				var response = TransactionCaller.sync("ECZ_MES-4.0/QUALITY_RESULTS_KAGIT/checkParameters/T_CHECK_PARAMETERS", {
						I_BATCH: BATCH,
					},
					"O_JSON"
				);

				if (response[1] == "E") {
					MessageBox.error(response[0]);
				} else {
					if (response[0].Rowsets?.Rowset?.Row == undefined) {
						//Kontrol kaydı yoksa default listeyi açan fonksiyon
						HANDLE = "", ROW_NUMBER = "1", SAMPLE_TIME = "";
						this.getTableData();
					} else {
						//Kontrol kaydı varsa ilgili kayıtların modelini pop-up içinde atacak alan
						var myModel = new sap.ui.model.json.JSONModel();
						if (Array.isArray(response[0]?.Rowsets?.Rowset?.Row)) {
							myModel.setData(response[0]);
						} else if (!response[0]?.Rowsets?.Rowset?.Row) {
							myModel.setData(null);
						} else {
							var obj_iv_data = response[0];
							var dummyData = [];
							dummyData.push(response[0].Rowsets.Rowset.Row);
							obj_iv_data.Rowsets.Rowset.Row = dummyData;
							myModel.setData(obj_iv_data);
						}
						//pop-up açan ve içine modelini atayan kısım
						this.getDialog().open();
						sap.ui.core.Fragment.byId("logResults_Fragment", "idLogTable").setModel(myModel);
					}
				}
			},

			//Kontrol kaydı pop-up fragment
			getDialog: function () {
				if (!this.oDialog) {
					this.oDialog = sap.ui.xmlfragment("logResults_Fragment", "customOrderScreen.view.fragments.logResults_Fragment", this);
					this.getView().addDependent(this.oDialog);
				}
				return this.oDialog;
			},
			
			//Pop-up kapatan fonksiyon
			onFragmentClose: function () {
				if (this.oDialog) {
					this.oDialog.close();
				}
			},

			//Default ekranı açan fonksiyon
			getTableData: function () {
				TransactionCaller.async("ECZ_MES-4.0/QUALITY_RESULTS_KAGIT/getParameters/T_GET_QUALITY_RESULTS", {
						I_BATCH: BATCH,
						I_HANDLE: HANDLE
					},
					"O_JSON",
					this.getTableDataCB,
					this
				);
			},

			getTableDataCB: function (iv_data, iv_scope) {
				if (iv_data[1] == "E") {
					MessageBox.error(iv_data[0]);
				} else {
					var myModel = new sap.ui.model.json.JSONModel();
					myModel.setSizeLimit(500);
					if (Array.isArray(iv_data[0].Rowsets?.Rowset?.Row)) {
						var oModel = {
							Rowsets: {
								Rowset: {
									Row: []
								}
							}
						};

						for (var i = 0; i < iv_data[0].Rowsets.Rowset.Row.length; i++) {
							var oData = {
								SEQUENCE: "",
								MIN_VALUE: "",
								MIN_VALUE2: "",
								MAX_VALUE: "",
								MAX_VALUE2: "",
								TARGET_VALUE: "",
								DESCRIPTION: "",
								DATA_TYPE: "",
								DC_GROUP: "",
								SITE: "",
								VALUE: "",
								DESC: "",
								ALLOW_MISSING_VALUE: "",
								COMBO_DATA: []
							};

							var zData = {
								DATA_VALUE: "",
								DATA_TAG: ""
							};

							var existing = false;
							for (var j = 0; j < i; j++) {
								if (oModel.Rowsets.Rowset.Row[j]?.SEQUENCE == iv_data[0].Rowsets.Rowset.Row[i].SEQUENCE) {
									zData.DATA_VALUE = iv_data[0].Rowsets.Rowset.Row[i].DATA_VALUE;
									zData.DATA_TAG = iv_data[0].Rowsets.Rowset.Row[i].DATA_TAG;
									oModel.Rowsets.Rowset.Row[j].COMBO_DATA.push(zData);
									existing = true;
								}
							}

							if (existing == false) {
								oData.SEQUENCE = iv_data[0].Rowsets.Rowset.Row[i].SEQUENCE;
								oData.MIN_VALUE = iv_data[0].Rowsets.Rowset.Row[i].MIN_VALUE;
								oData.MIN_VALUE2 = iv_data[0].Rowsets.Rowset.Row[i].MIN_VALUE2;
								oData.MAX_VALUE = iv_data[0].Rowsets.Rowset.Row[i].MAX_VALUE;
								oData.MAX_VALUE2 = iv_data[0].Rowsets.Rowset.Row[i].MAX_VALUE2;
								oData.TARGET_VALUE = iv_data[0].Rowsets.Rowset.Row[i].TARGET_VALUE;
								oData.DESCRIPTION = iv_data[0].Rowsets.Rowset.Row[i].DESCRIPTION;
								oData.DATA_TYPE = iv_data[0].Rowsets.Rowset.Row[i].DATA_TYPE;
								oData.DC_GROUP = iv_data[0].Rowsets.Rowset.Row[i].DC_GROUP;
								oData.SITE = iv_data[0].Rowsets.Rowset.Row[i].SITE;
								oData.VALUE = iv_data[0].Rowsets.Rowset.Row[i].VALUE;
								oData.DESC = iv_data[0].Rowsets.Rowset.Row[i].DESC;
								oData.ALLOW_MISSING_VALUE = iv_data[0].Rowsets.Rowset.Row[i].ALLOW_MISSING_VALUE;
								zData.DATA_VALUE = iv_data[0].Rowsets.Rowset.Row[i].DATA_VALUE;
								zData.DATA_TAG = iv_data[0].Rowsets.Rowset.Row[i].DATA_TAG;
								oData.COMBO_DATA.push(zData);
								oModel.Rowsets.Rowset.Row.push(oData);
							}
						};
						myModel.setData(oModel);
					} else if (!iv_data[0].Rowsets?.Rowset?.Row) {
						myModel.setData(null);
					} else {
						var obj_iv_data = iv_data[0];
						var dummyData = [];
						dummyData.push(iv_data[0].Rowsets.Rowset.Row);
						obj_iv_data.Rowsets.Rowset.Row = dummyData;
						myModel.setData(obj_iv_data);
					}

					iv_scope.getView().byId("idQualityResultTable").setModel(myModel);
					iv_scope.colorTableRows();
					iv_scope.getView().byId("idQualityResultTable").getModel().refresh();
				}
			},

			//Ekrandaki combobox veya input alanlarının değerlerinin değişimi ile çalışan fonksiyon
			valueChange: function () {
				this.colorTableRows();
				this.getView().byId("idQualityResultTable").getModel().refresh();
			},

			//Tablonun satırlarını renklendirmeye yarayan fonksiyon
			colorTableRows: function () {
				var tableRowDetails = this.getView().byId("idQualityResultTable").getModel().oData?.Rowsets?.Rowset?.Row;
				var length = this.getView().byId("idQualityResultTable").getModel().oData?.Rowsets?.Rowset?.Row?.length;
				var tableItems = this.getView().byId("idQualityResultTable").getItems();

				for (var j = 0; j < length; j++) {
					//Öncelikle tablonun satırlarındaki classların tamamını kaldırıp temizlenir
					tableItems[j].removeStyleClass("redBackground");
					tableItems[j].removeStyleClass("yellowBackground");
					tableItems[j].removeStyleClass("greenBackground");
					tableItems[j].removeStyleClass("grayBackground");

					if (tableRowDetails[j].DATA_TYPE == "L") {
						//DATA_TYPE "L" ise bu combobox olduğunu gösterir ve seçilen değere göre tablo satırına durum ataması yapan koşullandırma
						var value = tableRowDetails[j].VALUE;

						if (value == "Uygun" || value == "Evet") {
							tableItems[j].addStyleClass("grayBackground");
						} else if (value == "Şartlı Kabul") {
							tableItems[j].addStyleClass("yellowBackground");
						} else if (value == "Uygun değil" || value == "Uygun Değil" || value == "Hayır") {
							tableItems[j].addStyleClass("redBackground");
						} else {
							tableItems[j].addStyleClass("grayBackground");
						}
					} else if (tableRowDetails[j].DATA_TYPE == "N") {
						//DATA_TYPE "N" ise bu input olduğunu gösterir ve girilen değere göre tablo satırına durum ataması yapan koşullandırma
						var minValue = tableRowDetails[j].MIN_VALUE;
						var minValue2 = tableRowDetails[j].MIN_VALUE2;
						var maxValue = tableRowDetails[j].MAX_VALUE;
						var maxValue2 = tableRowDetails[j].MAX_VALUE2;
						var value = tableRowDetails[j].VALUE;

						if ((minValue != null && minValue != "") && (minValue2 != null && minValue2 != "") && (maxValue != null && maxValue != "") && (
								maxValue2 != null && maxValue2 != "")) {
							if (value != "" && value != null) {
								if ((Number(value) < (Number(minValue) * 0.9)) || (Number(value) > (Number(maxValue2) * 1.1))) {
									MessageBox.error("Girilen değer limit aşımı sebebiyle geçersizdir!");
									tableRowDetails[j].VALUE = "";
									tableItems[j].addStyleClass("grayBackground");
								} else {
									if ((Number(minValue2) <= Number(value)) && (Number(value) <= Number(maxValue))) {
										tableItems[j].addStyleClass("grayBackground");
									} else if (((Number(minValue) <= Number(value)) && (Number(value) < Number(minValue2))) || ((Number(maxValue) < Number(value)) &&
											(Number(value) <= Number(maxValue2)))) {
										tableItems[j].addStyleClass("yellowBackground");
									} else {
										tableItems[j].addStyleClass("redBackground");
									}
								}
							} else {
								tableItems[j].addStyleClass("grayBackground");
							}
						} else {
							if (value != "" && value != null) {
								tableItems[j].addStyleClass("grayBackground");
							} else {
								tableItems[j].addStyleClass("grayBackground");
							}
						}
					}
				}
			},

			//Ekrandaki Sisteme Kaydet butonuna basınca çalışan fonksiyon
			onPressSaveButton: function () {
				var oTableData = this.getView().byId("idQualityResultTable").getModel()?.getData();
				if (oTableData == undefined) {
					MessageBox.error("Ekranda kaydedilecek veri bulunmamaktadır");
					return;
				}

				for (var i = 0; i < oTableData.Rowsets.Rowset.Row.length; i++) {
					if (oTableData.Rowsets.Rowset.Row[i].VALUE == "" || oTableData.Rowsets.Rowset.Row[i].VALUE == null) {
						if (oTableData.Rowsets.Rowset.Row[i].ALLOW_MISSING_VALUE == false) {
							MessageBox.error(oTableData.Rowsets.Rowset.Row[i].DESCRIPTION + " parametresi için geçerli bir sonuç girişi yapınız");
							return;
						}
					}

					if (oTableData.Rowsets.Rowset.Row[i].DATA_TYPE == "L") {
						if ((oTableData.Rowsets.Rowset.Row[i].VALUE == "Uygun Değil" || oTableData.Rowsets.Rowset.Row[i].VALUE == "Şartlı Kabul") && (
								oTableData.Rowsets.Rowset.Row[i].DESC == "" || oTableData.Rowsets.Rowset.Row[i].DESC == null)) {
							MessageBox.error(oTableData.Rowsets.Rowset.Row[i].DESCRIPTION + " parametresi için açıklama girilmesi zorunludur");
							return;
						}
					}

					if (oTableData.Rowsets.Rowset.Row[i].DATA_TYPE == "N") {
						if ((oTableData.Rowsets.Rowset.Row[i].MIN_VALUE2 != "" && oTableData.Rowsets.Rowset.Row[i].MIN_VALUE2 != null) && (oTableData.Rowsets
								.Rowset.Row[i].MAX_VALUE != "" && oTableData.Rowsets.Rowset.Row[i].MAX_VALUE != null) && (oTableData.Rowsets.Rowset.Row[i].VALUE !=
								"" && oTableData.Rowsets.Rowset.Row[i].VALUE != null)) {
							if (((oTableData.Rowsets.Rowset.Row[i].VALUE < oTableData.Rowsets.Rowset.Row[i].MIN_VALUE2) || (oTableData.Rowsets.Rowset.Row[i]
									.VALUE > oTableData.Rowsets.Rowset.Row[i].MAX_VALUE)) && (oTableData.Rowsets.Rowset.Row[i].DESC == "" || oTableData.Rowsets.Rowset
									.Row[i].DESC == null)) {
								MessageBox.error(oTableData.Rowsets.Rowset.Row[i].DESCRIPTION + " parametresi için açıklama girilmesi zorunludur");
								return;
							}
						}
					}
				}

				var SITE = oTableData.Rowsets.Rowset.Row[0].SITE;
				var DC_GROUP = oTableData.Rowsets.Rowset.Row[0].DC_GROUP;

				var resultArray = [];
				for (var i = 0; i < oTableData.Rowsets.Rowset.Row.length; i++) {
					var oData = {
						SEQUENCE: "",
						DATA_TYPE: "",
						VALUE: "",
						DESC: "",
					};

					oData.SEQUENCE = oTableData.Rowsets.Rowset.Row[i].SEQUENCE;
					oData.DATA_TYPE = oTableData.Rowsets.Rowset.Row[i].DATA_TYPE;
					oData.VALUE = oTableData.Rowsets.Rowset.Row[i].VALUE;
					oData.DESC = oTableData.Rowsets.Rowset.Row[i].DESC;
					resultArray.push(oData);
				}

				var iTableData = JSON.stringify(resultArray);
				this.getView().byId("idSaveButton").setEnabled(false);

				var response = TransactionCaller.sync("ECZ_MES-4.0/QUALITY_RESULTS_KAGIT/sendParameters/T_SEND_PARAMETERS", {
						I_TABLEDATA: iTableData,
						I_BATCH: BATCH,
						I_HANDLE: HANDLE,
						I_ROW_NUMBER: ROW_NUMBER,
						I_SAMPLE_TIME: SAMPLE_TIME,
						I_SITE: SITE,
						I_DCGROUP: DC_GROUP,
						I_OPERATION: OPERATION
					},
					"O_JSON"
				);

				if (response[1] == "E") {
					MessageBox.error(response[0]);
					this.getView().byId("idSaveButton").setEnabled(true);
				} else {
					MessageToast.show(response[0]);
					this.getView().byId("idSaveButton").setEnabled(true);
					this.getView().byId("idQualityResultTable").getModel().setData(null);
					this.getView().byId("idQualityResultTable").getModel().refresh();
					this.openLogFragment();
				}
			},

			onFragmentCreate: function () {
				HANDLE = "", SAMPLE_TIME = "";
				if (sap.ui.core.Fragment.byId("logResults_Fragment", "idLogTable").getModel()?.getData()?.Rowsets?.Rowset?.Row == undefined) {
					ROW_NUMBER = "1";
				} else {
					var length = sap.ui.core.Fragment.byId("logResults_Fragment", "idLogTable").getModel().getData().Rowsets.Rowset.Row.length;
					ROW_NUMBER = sap.ui.core.Fragment.byId("logResults_Fragment", "idLogTable").getModel().getData().Rowsets.Rowset.Row[0].ROW_NUMBER +
						1;
				}

				this.getTableData();
				this.getDialog().close();
			},

			onFragmentEdit: function (oEvent) {
				var selectedIndex = oEvent.oSource.getParent().getBindingContext().getPath().split("/")[4];
				var oTableData = sap.ui.core.Fragment.byId("logResults_Fragment", "idLogTable").getModel().getData();
				HANDLE = oTableData.Rowsets.Rowset.Row[selectedIndex].HANDLE;
				ROW_NUMBER = oTableData.Rowsets.Rowset.Row[selectedIndex].ROW_NUMBER;
				SAMPLE_TIME = oTableData.Rowsets.Rowset.Row[selectedIndex].START_TIME;

				this.getTableData();
				this.getDialog().close();
			},

			textChange: function (oEvent) {
				var selectedIndex = oEvent.oSource.getParent().getBindingContext().getPath().split("/")[4];
				var oTableData = this.getView().byId("idQualityResultTable").getModel().getData();
				var DESC = oTableData.Rowsets.Rowset.Row[selectedIndex].DESC;

				if (DESC.length > 40) {
					MessageBox.error("Açıklama alanına 40 karakter daha uzun metin girişi yapamazsınız");
					oTableData.Rowsets.Rowset.Row[selectedIndex].DESC = DESC.substring(0, 40);
					this.getView().byId("idQualityResultTable").getModel().refresh();
				}
			},

			onPressNavigateBack: function () {
				oRouter.navTo("RouteMain3", {
					"PARENTSFC": selectedParentSfc,
					"WorkCenter" : selectedWorkCenter,
					"MILINDICATOR" : selectedOrderStatu,
					"PLANT": PLANT
				});
			}

		});
	}
);