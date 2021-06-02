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
    		"reasonCodeMasterDataScreen/scripts/transactionCaller",
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
    		var that, selectedID, selectedDefID;

    		return Controller.extend("reasonCodeMasterDataScreen.controller.Main", {
    			onInit: function () {
    				that = this;

    				this.getSiteInfo();
    			},
    			
    			reasonCodeChange: function (){
    				var reasonCode = sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE_DEF", "idStoppageCode").getValue().toLowerCase();
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE_DEF", "idStoppageCode").setValue(reasonCode);
    				
    			},

    			//Filtre Seçenekleri panelini açıp kapatan fonksiyon
    			onOverflowToolbarPress: function () {
    				var oPanel = this.byId("expandablePanel");
    				oPanel.setExpanded(!oPanel.getExpanded());
    			},

    			//EKRANDAKİ ÜRETİM YERİ COMBOBOX MODELİNİ DOLDURAN FONKS.
    			getSiteInfo: function () {
    				var response = TransactionCaller.sync("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/findSite/T_SlcSite", {},
    					"O_JSON"
    				);

    				if (response[1] == "E") {
    					MessageBox.error(response[0]);
    				} else {
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

    					this.getView().byId("idSite").setModel(myModel);
    					this.getView().byId("idSite").getModel().refresh();
    				}
    			},

    			//EKRANDAKİ İŞ YERİ COMBOBOX MODELİNİ DOLDURAN FONKS.
    			getWorkCenterList: function () {
    				var response = TransactionCaller.sync("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/findWorkCenters/T_GetWCFromSite", {
    						I_SITE: this.getView().byId("idSite").getSelectedKey()
    					},
    					"O_JSON"
    				);

    				if (response[1] == "E") {
    					MessageBox.error(response[0]);
    				} else {
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

    					this.getView().byId("idWorkplace").setModel(myModel);
    					this.getView().byId("idWorkplace").getModel().refresh();
    				}
    			},

    			//EKRANDAN İŞ YERİ SEÇİLİNCE ÇALIŞAN FONKSİYONLAR
    			onChangeWorkcenter: function () {
    				this.getFunctionalLocations();
    				this.getPMWorkplaces();
    				this.getInitialData();
    				this.getAllStoppageTypes();
    			},

    			//EKRANDAKİ TABLOYU YENİLE BUTONUNA BASILINCA ÇALIŞAN FONKS.
    			onPressRefreshTable: function () {
    				this.getInitialData();
    			},

    			//EKRANDA FİLTRELE BUTONUNA BASILINCA ÇALIŞAN FONKS.
    			onPressSearchFilter: function () {
    				this.getInitialData();
    			},

    			//EKRANDAKİ FİLTRELERİ TEMİZLEYEN FONKS.
    			onPressCleanFilter: function () {
    				this.getView().byId("INP1").setSelectedKey("");
    				this.getView().byId("INP2").setValue("");
    				this.getView().byId("INP3").setValue("");
    				this.getView().byId("INP4").setValue("");
    				this.getView().byId("INP5").setValue("");
    				this.getView().byId("INP6").setValue("");
    				this.getView().byId("INP7").setSelectedKey("");
    				this.getView().byId("INP8").setValue("");
    				this.getView().byId("INP9").setValue("");
    				this.getView().byId("INP10").setSelectedKey("");
    				this.getInitialData();
    			},

    			//EKRANA VERİLERİ ÇEKEN FONKS.
    			getInitialData: function () {
    				var INP1 = this.getView().byId("INP1").getSelectedKey();
    				var INP2 = this.getView().byId("INP2").getValue();
    				var INP3 = this.getView().byId("INP3").getValue();
    				var INP4 = this.getView().byId("INP4").getValue();
    				var INP5 = this.getView().byId("INP5").getValue();
    				var INP6 = this.getView().byId("INP6").getValue();
    				var INP7 = this.getView().byId("INP7").getSelectedKey();
    				var INP8 = this.getView().byId("INP8").getValue();
    				var INP9 = this.getView().byId("INP9").getValue();
    				var INP10 = this.getView().byId("INP10").getSelectedKey();

    				TransactionCaller.async("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/getReasonCodes/T_GetReasonCodes", {
    						I_SITE: this.getView().byId("idSite").getSelectedKey(),
    						I_WORKPLACE: this.getView().byId("idWorkplace").getSelectedKey(),
    						I_FILTER1: INP1,
    						I_FILTER2: INP2,
    						I_FILTER3: INP3,
    						I_FILTER4: INP4,
    						I_FILTER5: INP5,
    						I_FILTER6: INP6,
    						I_FILTER7: INP7,
    						I_FILTER8: INP8,
    						I_FILTER9: INP9,
    						I_FILTER10: INP10,
    					},
    					"O_JSON",
    					this.getInitialDataCB,
    					this,
    					"GET"
    				);
    			},

    			getInitialDataCB: function (iv_data, iv_scope) {
    				if (iv_data[1] == "E") {
    					MessageBox.error(iv_data[0]);
    				} else {
    					var myModel = new sap.ui.model.json.JSONModel();
    					if (Array.isArray(iv_data[0]?.Rowsets?.Rowset?.Row)) {
    						myModel.setData(iv_data[0]);
    					} else if (!iv_data[0]?.Rowsets?.Rowset?.Row) {
    						myModel.setData(null);
    					} else {
    						var obj_iv_data = iv_data[0];
    						var dummyData = [];
    						dummyData.push(iv_data[0].Rowsets.Rowset.Row);
    						obj_iv_data.Rowsets.Rowset.Row = dummyData;
    						myModel.setData(obj_iv_data);
    					}
    					myModel.setSizeLimit(999);
    					iv_scope.getView().byId("idReasonCodeTable").setModel(myModel);
    					iv_scope.getView().byId("idReasonCodeTable").getModel().refresh();
    					MessageToast.show("Tablo Güncellendi");
    				}
    			},

    			//YENİ DURUŞ TİPİ EKLE BUTONUNA BASILINCA ÇALIŞAN FONKS.
    			onPressAddReasonCode: function (oEvent) {
    				if (this.getView().byId("idSite").getSelectedKey() == "") {
    					MessageBox.error("Üretim Yeri Seçiniz!");
    					return;
    				}

    				if (this.getView().byId("idWorkplace").getSelectedKey() == "") {
    					MessageBox.error("İş Yeri Seçiniz!");
    					return;
    				}

    				if (!this.addReasonCodeFragment) {
    					this.addReasonCodeFragment = sap.ui.xmlfragment("Z_ADD_REASON_CODE", "reasonCodeMasterDataScreen.view.fragments.addReasonCode",
    						this);
    					this.getView().addDependent(this.addReasonCodeFragment);
    				}

    				selectedID = "";

    				this.getFunctionalLocations();
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idToolComboBox").setSelectedKey("");

    				this.getAllStoppageTypes();
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idreasonCode1").setValue("");
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idreasonCode2").setValue("");
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idreasonCode3").setValue("");
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idreasonCode4").setValue("");
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idreasonCode5").setValue("");

    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idStoppageType").setSelectedKey("");
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idCatalogCode").setValue("");
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idCodeGroup").setValue("");
    				this.getPMWorkplaces();
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idPMWorkplace").setSelectedKey("");

    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idAcceptIcon1").setVisible(false);
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idRejectIcon1").setVisible(false);
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idAcceptIcon2").setVisible(false);
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idRejectIcon2").setVisible(false);
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idAcceptIcon3").setVisible(false);
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idRejectIcon3").setVisible(false);
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idAcceptIcon4").setVisible(false);
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idRejectIcon4").setVisible(false);
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idAcceptIcon5").setVisible(false);
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idRejectIcon5").setVisible(false);

    				this.addReasonCodeFragment.setTitle("Yeni Duruş Tipi Ekle");
    				this.addReasonCodeFragment.open();
    			},

    			//TABLODAN BİR SATIRIN BİLGİLERİNİ GÜNCELLE BUTONUNA BASINCA ÇALIŞAN FONKS.
    			onPressUpdateReasonCode: function (oEvent) {
    				var selectedIndex = oEvent.oSource.getParent().getBindingContext().getPath().split("/")[4];
    				var oTableData = this.getView().byId("idReasonCodeTable").getModel().getData().Rowsets.Rowset.Row;
    				var selectedRow = oTableData[selectedIndex];
    				selectedID = selectedRow.ID;

    				if (!this.addReasonCodeFragment) {
    					this.addReasonCodeFragment = sap.ui.xmlfragment("Z_ADD_REASON_CODE", "reasonCodeMasterDataScreen.view.fragments.addReasonCode",
    						this);
    					this.getView().addDependent(this.addReasonCodeFragment);
    				}

    				this.getFunctionalLocations();
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idToolComboBox").setSelectedKey(selectedRow.TOOL);

    				this.getAllStoppageTypes();
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idreasonCode1").setValue(selectedRow.REASON_CODE1);
    				this.changeReasonCode(undefined, "idreasonCode1");

    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idreasonCode2").setValue(selectedRow.REASON_CODE2);
    				this.changeReasonCode(undefined, "idreasonCode2");

    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idreasonCode3").setValue(selectedRow.REASON_CODE3);
    				this.changeReasonCode(undefined, "idreasonCode3");

    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idreasonCode4").setValue(selectedRow.REASON_CODE4);
    				this.changeReasonCode(undefined, "idreasonCode4");

    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idreasonCode5").setValue(selectedRow.REASON_CODE5);
    				this.changeReasonCode(undefined, "idreasonCode5");

    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idStoppageType").setSelectedKey(selectedRow.REASON_TYPE);
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idCatalogCode").setValue(selectedRow.CATALOG_CODE);
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idCodeGroup").setValue(selectedRow.CODE_GROUP);

    				this.getPMWorkplaces();
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idPMWorkplace").setSelectedKey(selectedRow.RESP_WORK_CENTER);

    				this.addReasonCodeFragment.setTitle("Duruş Tipini Güncelle");
    				this.addReasonCodeFragment.open();
    			},

    			//TABLODAN BİR SATIRIN BİLGİLERİNİ SİL BUTONUNA BASINCA ÇALIŞAN FONKS.
    			onPressDeleteReasonCode: function (oEvent) {
    				var selectedIndex = oEvent.oSource.getParent().getBindingContext().getPath().split("/")[4];
    				var oTableData = this.getView().byId("idReasonCodeTable").getModel().getData().Rowsets.Rowset.Row;
    				var selectedRow = oTableData[selectedIndex];
    				selectedID = selectedRow.ID;

    				MessageBox.warning("İlgili kayıt sistemden silinecektir\r\n\r\nOnaylıyor musunuz?", {
    					actions: ["Onayla", "İptal"],
    					emphasizedAction: "İptal",
    					onClose: function (sAction) {
    						if (sAction == "Onayla") {
    							var response = TransactionCaller.sync("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/deleteReasoncode/T_DeleteReasonCode", {
    									I_ID: selectedID
    								},
    								"O_JSON"
    							);

    							if (response[1] == "E") {
    								MessageBox.error(response[0]);
    							} else {
    								MessageBox.information(response[0]);
    								that.getInitialData();
    							}
    						}
    					},
    				});
    			},

    			//YENİ DURUŞ TİPİ YARATIRKEN AÇILAN FRAGMENT İÇİNDEKİ LOKASYON (TEKNİK BİRİM) COMBOBOX MODELİNİ DOLDURAN FONKS.
    			getFunctionalLocations: function () {
    				var response = TransactionCaller.sync("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/findFunctionalLocation/T_SlcFunctionalLocation", {
    						I_SITE: this.getView().byId("idSite").getSelectedKey(),
    						I_WORKPLACE: this.getView().byId("idWorkplace").getSelectedKey()
    					},
    					"O_JSON"
    				);

    				if (response[1] == "E") {
    					MessageBox.error(response[0]);
    				} else {
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

    					if (this.addReasonCodeFragment) {
    						sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idToolComboBox").setModel(myModel);
    					}
    					this.getView().byId("INP1").setModel(myModel);
    				}
    			},

    			//YENİ DURUŞ TİPİ YARATIRKEN AÇILAN FARGMENT İÇİNE DURUŞ TİPLERİNE SUGGESTION GETİREN FONKSİYON
    			getAllStoppageTypes: function () {
    				var response = TransactionCaller.sync("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/getAllStoppageTypes/T_GET_ALL_STOPPAGE_TYPES", {},
    					"O_JSON"
    				);

    				if (response[1] == "E") {
    					MessageBox.error(response[0]);
    				} else {
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

    					myModel.setSizeLimit(5000);
    					if (this.addReasonCodeFragment) {
    						sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idreasonCode1").setModel(myModel);
    						sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idreasonCode2").setModel(myModel);
    						sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idreasonCode3").setModel(myModel);
    						sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idreasonCode4").setModel(myModel);
    						sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idreasonCode5").setModel(myModel);
    					}

    					this.getView().byId("INP2").setModel(myModel);
    					this.getView().byId("INP3").setModel(myModel);
    					this.getView().byId("INP4").setModel(myModel);
    					this.getView().byId("INP5").setModel(myModel);
    					this.getView().byId("INP6").setModel(myModel);
    				}
    			},

    			//YENİ DURUŞ TİPİ YARATIRKEN AÇILAN FRAGMENT İÇİNDEKİ PM İŞ YERİ COMBOBOX MODELİNİ DOLDURAN FONKS.
    			getPMWorkplaces: function (oEvent) {
    				var response = TransactionCaller.sync("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/getAllPMWorkplaces/T_GetAllPMWorkplaces", {
    						I_SITE: this.getView().byId("idSite").getSelectedKey(),
    						I_LOCATION: this.getView().byId("idWorkplace").getSelectedKey()
    					},
    					"O_JSON"
    				);

    				if (response[1] == "E") {
    					MessageBox.error(response[0]);
    				} else {
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

    					if (this.addReasonCodeFragment) {
    						sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idPMWorkplace").setModel(myModel);
    					}
    					this.getView().byId("INP10").setModel(myModel);
    				}
    			},

    			//Duruş Tipi değişince tanımının olup olmadığını kontrol eden fonks.
    			changeReasonCode: function (oEvent, Parameter) {
    				if (oEvent != undefined) {
    					var selectedParameter = oEvent.getSource().getId().split("--")[1];
    				} else {
    					var selectedParameter = Parameter;
    				}

    				var assignParameter = selectedParameter.charAt(selectedParameter.length - 1);

    				var reasonCode = sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", selectedParameter).getValue();
    				if (reasonCode != "") {
    					var response = TransactionCaller.sync("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/checkReasonCode/T_CheckReasonCode", {
    							I_REASONCODE: reasonCode,
    						},
    						"O_JSON"
    					);

    					if (response[1] == "E") {
    						sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idAcceptIcon" + assignParameter).setVisible(false);
    						sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idRejectIcon" + assignParameter).setVisible(true);
    					} else {
    						sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idAcceptIcon" + assignParameter).setVisible(true);
    						sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idRejectIcon" + assignParameter).setVisible(false);
    					}
    				} else {
    					sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idAcceptIcon" + assignParameter).setVisible(false);
    					sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idRejectIcon" + assignParameter).setVisible(false);
    				}

    			},

    			//YENİ DURUŞ TİPİ YARATIRKEN AÇILAN FRAGMENT İÇİNDEKİ KAYDET BUTONUNA BASILINCA ÇALIŞAN FONKS.
    			onPressSaveReasonCodeButton: function (oEvent) {
    				var selectedSite = this.getView().byId("idSite").getSelectedKey();
    				if (selectedSite == "" || selectedSite == null) {
    					MessageBox.error("Lütfen üretim yeri seçiniz!");
    					return;
    				}

    				var selectedWC = this.getView().byId("idWorkplace").getSelectedKey();
    				if (selectedWC == "" || selectedWC == null) {
    					MessageBox.error("Lütfen iş yeri seçiniz!");
    					return;
    				}

    				var selectedTool = sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idToolComboBox").getSelectedKey();
    				if (selectedTool == "" || selectedTool == null) {
    					MessageBox.error("Lütfen lokasyon seçiniz!");
    					return;
    				}

    				var reasonCode1 = sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idreasonCode1").getValue();
    				var reasonCode2 = sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idreasonCode2").getValue();
    				var reasonCode3 = sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idreasonCode3").getValue();
    				var reasonCode4 = sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idreasonCode4").getValue();
    				var reasonCode5 = sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idreasonCode5").getValue();
    				if (reasonCode1 == "" && reasonCode2 == "" && reasonCode3 == "" && reasonCode4 == "" && reasonCode5 == "") {
    					MessageBox.error("En az 1 duruş tipi giriniz!");
    					return;
    				}

    				var codeError1 = sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idRejectIcon1").getVisible();
    				var codeError2 = sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idRejectIcon2").getVisible();
    				var codeError3 = sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idRejectIcon3").getVisible();
    				var codeError4 = sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idRejectIcon4").getVisible();
    				var codeError5 = sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idRejectIcon5").getVisible();
    				if (codeError1 == true || codeError2 == true || codeError3 == true || codeError4 == true || codeError5 == true) {
    					MessageBox.error("Sisteme tanımsız duruş kodu giremezsiniz!");
    					return;
    				}

    				var stoppageType = sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idStoppageType").getSelectedKey();
    				if (stoppageType == "" || stoppageType == null) {
    					MessageBox.error("Lütfen duruş türü seçiniz!");
    					return;
    				}

    				var catalogCode = sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idCatalogCode").getValue();
    				if (catalogCode == "" || catalogCode == null) {
    					MessageBox.error("Lütfen katalog kodu giriniz!");
    					return;
    				}

    				var codeGroup = sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idCodeGroup").getValue();
    				if (codeGroup == "" || codeGroup == null) {
    					MessageBox.error("Lütfen kod grubu giriniz!");
    					return;
    				}

    				var pmWorkplace = sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE", "idPMWorkplace").getSelectedKey();
    				// if (pmWorkplace == "" || pmWorkplace == null) {
    				// 	MessageBox.error("Lütfen sorumlu iş yeri seçiniz!");
    				// 	return;
    				// }

    				if (selectedID == "") {
    					//INSERT NEW
    					TransactionCaller.async("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/saveReasonCode/T_SaveReasonCode", {
    							I_SITE: selectedSite,
    							I_WORKCENTER: selectedWC,
    							I_TOOL: selectedTool,
    							I_REASONCODE1: reasonCode1,
    							I_REASONCODE2: reasonCode2,
    							I_REASONCODE3: reasonCode3,
    							I_REASONCODE4: reasonCode4,
    							I_REASONCODE5: reasonCode5,
    							I_STOPPAGE_TYPE: stoppageType,
    							I_CATALOGCODE: catalogCode,
    							I_CODEGROUP: codeGroup,
    							I_PMWORKPLACE: pmWorkplace,
    						},
    						"O_JSON",
    						this.onPressSaveReasonCodeButtonCB,
    						this,
    						"GET"
    					);
    				} else {
    					//UPDATE EXISTING
    					TransactionCaller.async("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/updateReasoncode/T_UpdateReasonCode", {
    							I_ID: selectedID,
    							I_SITE: selectedSite,
    							I_WORKCENTER: selectedWC,
    							I_TOOL: selectedTool,
    							I_REASONCODE1: reasonCode1,
    							I_REASONCODE2: reasonCode2,
    							I_REASONCODE3: reasonCode3,
    							I_REASONCODE4: reasonCode4,
    							I_REASONCODE5: reasonCode5,
    							I_STOPPAGE_TYPE: stoppageType,
    							I_CATALOGCODE: catalogCode,
    							I_CODEGROUP: codeGroup,
    							I_PMWORKPLACE: pmWorkplace
    						},
    						"O_JSON",
    						this.onPressSaveReasonCodeButtonCB,
    						this,
    						"GET"
    					);
    				}
    			},

    			onPressSaveReasonCodeButtonCB: function (iv_data, iv_scope) {
    				if (iv_data[1] == "E") {
    					MessageBox.error(iv_data[0]);
    				} else {
    					MessageBox.information(iv_data[0]);
    					iv_scope.addReasonCodeFragment.close();
    					iv_scope.getInitialData();
    				}
    			},

    			//YENİ DURUŞ TİPİ YARATIRKEN AÇILAN FRAGMENT İÇİNDEKİ İPTAL BUTONUNA BASILINCA ÇALIŞAN FONKS.
    			onPressCancelReasonCodeButton: function (oEvent) {
    				if (this.addReasonCodeFragment) {
    					this.addReasonCodeFragment.close();
    				}

    				if (this.showReasonCodeDefFragment) {
    					this.showReasonCodeDefFragment.close();
    				}
    			},

    			//EKRANDAN DURUŞ TİPİ LİSTESİNE BASILINCA FRAGMENT AÇAN FONKSİYON
    			onPressStoppageDefList: function () {
    				if (!this.showReasonCodeDefFragment) {
    					this.showReasonCodeDefFragment = sap.ui.xmlfragment("Z_SHOW_REASON_CODE_DEF",
    						"reasonCodeMasterDataScreen.view.fragments.stoppageDefinitionList", this);
    					this.getView().addDependent(this.showReasonCodeDefFragment);
    				}

    				sap.ui.core.Fragment.byId("Z_SHOW_REASON_CODE_DEF", "searchReasonCodeDef").setValue("");
    				this.getStoppageDefinitions("");
    				this.showReasonCodeDefFragment.open();
    			},

    			//DURUŞ TANIMLARINI FRAGMENTA GETİREN FONKS.
    			getStoppageDefinitions: function (searchParameter) {
    				TransactionCaller.async("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/getReasonCodeDefinitions/T_GET_Z_NTT_MT_REASON_CODE_T", {
    						I_SEARCH: searchParameter,
    					},
    					"O_JSON",
    					this.getStoppageDefinitionsCB,
    					this,
    					"GET"
    				);
    			},

    			getStoppageDefinitionsCB: function (iv_data, iv_scope) {
    				if (iv_data[1] == "E") {
    					MessageBox.error(iv_data[0]);
    				} else {
    					var myModel = new sap.ui.model.json.JSONModel();
    					if (Array.isArray(iv_data[0]?.Rowsets?.Rowset?.Row)) {
    						myModel.setData(iv_data[0]);
    					} else if (!iv_data[0]?.Rowsets?.Rowset?.Row) {
    						myModel.setData(null);
    					} else {
    						var obj_iv_data = iv_data[0];
    						var dummyData = [];
    						dummyData.push(iv_data[0].Rowsets.Rowset.Row);
    						obj_iv_data.Rowsets.Rowset.Row = dummyData;
    						myModel.setData(obj_iv_data);
    					}
    					myModel.setSizeLimit(999);
    					sap.ui.core.Fragment.byId("Z_SHOW_REASON_CODE_DEF", "idStoppageDefinitionTable").setModel(myModel);
    					sap.ui.core.Fragment.byId("Z_SHOW_REASON_CODE_DEF", "idStoppageDefinitionTable").getModel().refresh();
    				}
    			},

    			//FRAGMENT İÇİNDE ARAMA ÇUBUĞUNDA LIVECHANGE İLE ÇALIŞAN FONKSİYON
    			onSearch: function (oEvent) {
    				this.getStoppageDefinitions(oEvent.getSource().getValue());
    			},

    			//YENİ DURUŞ TİPİ EKLE BUTONUNA BASINCA FRAGMENT AÇAN FONKS.
    			onPressAddReasonCodeDef: function () {
    				if (!this.addReasonCodeDefFragment) {
    					this.addReasonCodeDefFragment = sap.ui.xmlfragment("Z_ADD_REASON_CODE_DEF",
    						"reasonCodeMasterDataScreen.view.fragments.addReasonCodeDef", this);
    					this.getView().addDependent(this.addReasonCodeDefFragment);
    				}

    				selectedDefID = "";
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE_DEF", "idStoppageCode").setValue("");
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE_DEF", "idStoppageCodeDef").setValue("");
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE_DEF", "fragmentDefineStoppage").setTitle("Yeni Duruş Tanımı Ekle");
    				this.addReasonCodeDefFragment.open();
    			},

    			//EKRANDAKİ DURUŞ TİPİ DÜZENLE BUTONUNA BASINCA FRAGMENT AÇAN FONKS.
    			onPressUpdateReasonCodeDef: function (oEvent) {
    				var selectedIndex = oEvent.oSource.getParent().getBindingContext().getPath().split("/")[4];
    				var oTableData = sap.ui.core.Fragment.byId("Z_SHOW_REASON_CODE_DEF", "idStoppageDefinitionTable").getModel().getData().Rowsets.Rowset
    					.Row;
    				var selectedRow = oTableData[selectedIndex];

    				if (!this.addReasonCodeDefFragment) {
    					this.addReasonCodeDefFragment = sap.ui.xmlfragment("Z_ADD_REASON_CODE_DEF",
    						"reasonCodeMasterDataScreen.view.fragments.addReasonCodeDef", this);
    					this.getView().addDependent(this.addReasonCodeDefFragment);
    				}

    				selectedDefID = selectedRow.ID;
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE_DEF", "idStoppageCode").setValue(selectedRow.REASON_CODE_ID);
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE_DEF", "idStoppageCodeDef").setValue(selectedRow.TEXT);
    				sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE_DEF", "fragmentDefineStoppage").setTitle("Duruş Tanımını Düzenle");
    				this.addReasonCodeDefFragment.open();
    			},

    			//EKRANDAKİ DURUŞ TİPİ SİL BUTONUNA BASINCA DİYALOG AÇAN VE SİLEN FONKS.
    			onPressDeleteReasonCodeDef: function (oEvent) {
    				var selectedIndex = oEvent.oSource.getParent().getBindingContext().getPath().split("/")[4];
    				var oTableData = sap.ui.core.Fragment.byId("Z_SHOW_REASON_CODE_DEF", "idStoppageDefinitionTable").getModel().getData().Rowsets.Rowset
    					.Row;
    				var selectedRow = oTableData[selectedIndex];
    				selectedDefID = selectedRow.ID;

    				MessageBox.warning("İlgili kayıt sistemden silinecektir\r\n\r\nOnaylıyor musunuz?", {
    					actions: ["Onayla", "İptal"],
    					emphasizedAction: "İptal",
    					onClose: function (sAction) {
    						if (sAction == "Onayla") {
    							var response = TransactionCaller.sync(
    								"ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/deleteReasonCodeDef/T_DEL_Z_NTT_MT_REASON_CODE_T", {
    									I_ID: selectedDefID
    								},
    								"O_JSON"
    							);

    							if (response[1] == "E") {
    								MessageBox.error(response[0]);
    							} else {
    								MessageBox.information(response[0]);
    								var searchParameter = sap.ui.core.Fragment.byId("Z_SHOW_REASON_CODE_DEF", "searchReasonCodeDef").getValue();
    								that.getStoppageDefinitions(searchParameter);
    							}
    						}
    					},
    				});
    			},

    			//YENİ DURUŞ TİPİ EKLE BUTONUNA BASINCA AÇILAN FRAGMENT İÇİNDE KAYDET BUTONUNA BASILINCA ÇALIŞAN FONKS.
    			onPressSaveReasonCodeDefButton: function (oEvent) {
    				var selectedStoppageCode = sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE_DEF", "idStoppageCode").getValue();
    				var selectedStoppageCodeDef = sap.ui.core.Fragment.byId("Z_ADD_REASON_CODE_DEF", "idStoppageCodeDef").getValue();

    				if (selectedStoppageCode == "" || selectedStoppageCodeDef == "") {
    					MessageBox.error("Duruş Kodu ve Duruş Kodu Tanımı alanları boş bırakılamaz");
    					return;
    				}

    				if (selectedDefID == "") {
    					//INSERT NEW
    					TransactionCaller.async("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/insertReasonCodeDef/T_INS_Z_NTT_MT_REASON_CODE_T", {
    							I_STOPPAGE_CODE: selectedStoppageCode,
    							I_STOPPAGE_CODE_DEF: selectedStoppageCodeDef,
    							I_LANGUAGE: "TR"
    						},
    						"O_JSON",
    						this.onPressSaveReasonCodeDefButtonCB,
    						this,
    						"GET"
    					);
    				} else {
    					//UPDATE EXISTING
    					TransactionCaller.async("ECZ_MES-4.0/PM_STOPPAGE_NOTIF_MANAGEMENT/updateReasoncodeDef/T_UPD_Z_NTT_MT_REASON_CODE_T", {
    							I_STOPPAGE_CODE: selectedStoppageCode,
    							I_STOPPAGE_CODE_DEF: selectedStoppageCodeDef,
    							I_LANGUAGE: "TR",
    							I_ID: selectedDefID
    						},
    						"O_JSON",
    						this.onPressSaveReasonCodeDefButtonCB,
    						this,
    						"GET"
    					);
    				}
    			},

    			onPressSaveReasonCodeDefButtonCB: function (iv_data, iv_scope) {
    				if (iv_data[1] == "E") {
    					MessageBox.error(iv_data[0]);
    				} else {
    					MessageBox.information(iv_data[0]);
    					iv_scope.addReasonCodeDefFragment.close();
    					var searchParameter = sap.ui.core.Fragment.byId("Z_SHOW_REASON_CODE_DEF", "searchReasonCodeDef").getValue();
    					iv_scope.getStoppageDefinitions(searchParameter);
    				}
    			},

    			//YENİ DURUŞ TİPİ EKLE BUTONUNA BASINCA AÇILAN FRAGMENT İÇİNDE İPTAL BUTONUNA BASILINCA ÇALIŞAN FONKS.
    			onPressCancelReasonCodeDefButton: function (oEvent) {
    				if (this.addReasonCodeDefFragment) {
    					this.addReasonCodeDefFragment.close();
    				}
    			}

    		});
    	}
    );