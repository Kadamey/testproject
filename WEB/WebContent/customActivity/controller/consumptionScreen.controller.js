sap.ui.define(
    [
        "jquery.sap.global",
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "customActivity/scripts/transactionCaller",
        "sap/m/MessageToast",
        "sap/m/MessageBox",
        "sap/ui/core/Fragment",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/export/library",
        "sap/ui/export/Spreadsheet",
    ],
    function (
        jQuery,
        Controller,
        JSONModel,
        TransactionCaller,
        MessageToast,
        MessageBox,
        Fragment,
        Filter,
        FilterOperator,
        exportLibrary,
        Spreadsheet
    ) {
        "use strict";
        var that, sPath;

        return Controller.extend("customActivity.controller.consumptionScreen", {
            onInit: function () {
                this.appComponent = this.getView().getViewData().appComponent;
                this.appData = this.appComponent.getAppGlobalData();

                this.getOrderInformation();
                this.automationControl();
                this.getData();
                this.lastSavingTime();

                if (this.appComponent.getRouter().oHashChanger.getHash().split(",")[1] == "0010") {
                    this.getView().byId("operationChange1").setEnabled(false);
                    this.getView().byId("operationChange2").setEnabled(true);
                    this.getView().byId("idAddScrap").setEnabled(false);
                    this.getView().byId("idPacalInfo").setEnabled(false);
                } else if (this.appComponent.getRouter().oHashChanger.getHash().split(",")[1] == "0020") {
                    this.getView().byId("operationChange1").setEnabled(true);
                    this.getView().byId("operationChange2").setEnabled(false);
                    this.getView().byId("idAddScrap").setEnabled(true);
                    this.getView().byId("idPacalInfo").setEnabled(true);
                } else {
                    this.getView().byId("operationChange1").setVisible(false);
                    this.getView().byId("operationChange2").setVisible(false);
                }

                that = this;
            },

            //Pota Şarj Operasyonu
            changeOperation1: function () {
                var orderNo = this.oView.oViewData.mode.split(",")[0];
                var castNo = this.oView.oViewData.mode.split(",")[2];
                var routingOperNo = "0010";
                var selectedLineInfos = [];
                selectedLineInfos.push(orderNo, routingOperNo, castNo);
                var formattedselectedLineInfos = selectedLineInfos.toString();
                this.appComponent.getRouter().navTo("activity", { activityId: "Z_CONSUMPTION_SCREEN", mode: formattedselectedLineInfos, });
            },

            //Fırın Şarj Operasyonu
            changeOperation2: function () {
                var orderNo = this.oView.oViewData.mode.split(",")[0];
                var castNo = this.oView.oViewData.mode.split(",")[2];
                var routingOperNo = "0020";
                var selectedLineInfos = [];
                selectedLineInfos.push(orderNo, routingOperNo, castNo);
                var formattedselectedLineInfos = selectedLineInfos.toString();
                this.appComponent.getRouter().navTo("activity", { activityId: "Z_CONSUMPTION_SCREEN", mode: formattedselectedLineInfos, });
            },

            //Sipariş bilgilerinin ekranın üstüne getiren fonksiyon
            getOrderInformation: function () {
                TransactionCaller.async("ItelliSTEEL/UI/SDMReportProd/T_GET_ORDER_INFORMATION", {
                    I_ORDERNO: this.getView().getViewData().mode.split(",")[0],
                },
                    "O_JSON",
                    this.getOrderInformationCB,
                    this,
                    "GET"
                );
            },

            getOrderInformationCB: function (iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();
                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    myModel.setData(iv_data[0]);
                } else if (!iv_data[0].Rowsets.Rowset.Row) {
                    myModel.setData(null);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                }

                iv_scope.getView().byId("idOrderNoArea").setValue(myModel.getData().Rowsets.Rowset.Row[0].ORDERNO);
                iv_scope.getView().byId("idCastNoArea").setValue(myModel.getData().Rowsets.Rowset.Row[0].CASTNO);
                iv_scope.getView().byId("idMaterialArea").setValue(myModel.getData().Rowsets.Rowset.Row[0].MATNR + " " + myModel.getData().Rowsets.Rowset.Row[0].MAKTX);
                iv_scope.getView().byId("idQuantity").setValue(myModel.getData().Rowsets.Rowset.Row[0].PSMNG + " " + myModel.getData().Rowsets.Rowset.Row[0].MSEHI);
            },

            //Ekrandaki tabloya verileri basan fonksiyon
            getData: function () {
                TransactionCaller.async("ItelliMES/UI/CONSUMPTION_SCREEN/GetData/T_GET_BOM_DATA2", {
                    I_ORDER: this.getView().getViewData().mode.split(",")[0],
                    I_OPERATION: this.getView().getViewData().mode.split(",")[1],
                    I_CASTNO: this.getView().getViewData().mode.split(",")[2],
                },
                    "O_JSON",
                    this.getDataCB,
                    this,
                    "GET"
                );
            },

            getDataCB: function (iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();
                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    myModel.setData(iv_data[0]);
                } else if (!iv_data[0].Rowsets.Rowset.Row) {
                    myModel.setData(null);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                }

                iv_scope.getView().byId("idProductsTable").setModel(myModel);
                iv_scope.getView().byId("idProductsTable").setBusy(false);
            },

            //OTOMASYON VERİLERİNİN DURUMUNU KONTROL EDEN TRANSACTION
            automationControl: function () {
                TransactionCaller.async("ItelliMES/UI/CONSUMPTION_SCREEN/checkAutomation/T_GET_ITE_TT_CONSUMPTION", {
                    I_ORDERNO: this.getView().getViewData().mode.split(",")[0],
                    I_OPERATIONNO: this.getView().getViewData().mode.split(",")[1],
                    I_CASTNO: this.getView().getViewData().mode.split(",")[2],
                },
                    "O_JSON",
                    this.automationControlCB,
                    this,
                    "GET"
                );
            },

            automationControlCB: function (iv_data, iv_scope) {
                if (iv_data[1] == "E") {
                    iv_scope.getView().byId("automationStatusPositive").setVisible(false);
                    iv_scope.getView().byId("automationStatusNegative").setVisible(true);
                } else {
                    iv_scope.getView().byId("automationStatusPositive").setVisible(true);
                    iv_scope.getView().byId("automationStatusNegative").setVisible(false);
                }
            },

            //SON KAYIT ZAMANINI KONTROL EDEN TRANSACTION
            lastSavingTime: function () {
                TransactionCaller.async("ItelliMES/UI/CONSUMPTION_SCREEN/lastSavedTime/T_GET_ITE_TT_CONSUMPTION", {
                    I_ORDERNO: this.getView().getViewData().mode.split(",")[0],
                    I_OPERATIONNO: this.getView().getViewData().mode.split(",")[1],
                    I_CASTNO: this.getView().getViewData().mode.split(",")[2],
                },
                    "O_JSON",
                    this.lastSavingTimeCB,
                    this,
                    "GET"
                );
            },

            lastSavingTimeCB: function (iv_data, iv_scope) {
                iv_scope.getView().byId("lastSavedTime").setText(iv_data[0].Rowsets.Rowset.Row.CONFDATE);
            },

            //Bileşen ekle butonu basılması ve fragment açılması
            onAdd: function (oEvent) {
                if (!this._oDialog) {
                    this._oDialog = sap.ui.xmlfragment("Z_MANUAL_COMPONENT_ADD", "customActivity.view.fragments.manualComponentAdd", this);
                    this.getView().addDependent(this._oDialog);
                }

                this._oDialog.open();

                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idMaterialNo").setValue("");
                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualQuantity").setValue("");
                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualUnit").setValue("");
                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualBatch").setValue("");

                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idMaterialNo").setEnabled(true);
                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idTextManualBatch").setVisible(false);
                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualBatch").setVisible(false);
                this.getMaterialList();
            },

            //Sıvı Çelik ekle butonu basılması ve fragment açılması
            onAdd2: function (oEvent) {
                if (!this._oDialog) {
                    this._oDialog = sap.ui.xmlfragment("Z_MANUAL_COMPONENT_ADD", "customActivity.view.fragments.manualComponentAdd", this);
                    this.getView().addDependent(this._oDialog);
                }

                this._oDialog.open();

                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idMaterialNo").setValue("");
                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualQuantity").setValue("");
                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualUnit").setValue("");
                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualBatch").setValue("");

                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idMaterialNo").setEnabled(false);
                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idTextManualBatch").setVisible(true);
                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualBatch").setVisible(true);
                this.getMaterialList();
            },

            //Manuel bileşen ekleme fragment içindeki malzeme combobox içine verilerin basılması
            getMaterialList: function () {
                TransactionCaller.async("ItelliMES/UI/CONSUMPTION_SCREEN/T_GetMaterialList",
                    {},
                    "O_JSON",
                    this.getMaterialListCB,
                    this
                );
            },

            getMaterialListCB: function (iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();
                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    myModel.setData(iv_data[0]);
                } else if (!iv_data[0].Rowsets.Rowset.Row) {
                    myModel.setData(null);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                }

                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idMaterialNo").setModel(myModel);
            },

            //Fragment içinde malzeme seçildiğinde malzeme biriminin ilgili comboboxa atanması
            onManualMaterialSelected: function (oEvent) {
                var selectedMaterial = oEvent.getSource().getSelectedKey();

                for (var i = 0; i < sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idMaterialNo").getModel().getData().Rowsets.Rowset.Row.length; i++) {
                    if (sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idMaterialNo").getModel().getData().Rowsets.Rowset.Row[i].MATCODE == selectedMaterial) {
                        break;
                    }
                }

                sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualUnit").setValue(sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idMaterialNo").getModel().getData().Rowsets.Rowset.Row[i].UNIT);
            },

            //SIVI ÇELİK EKLEME FRAGMENT İÇİNDE DÖKÜM NO EKLENİNCE ÇALIŞAN FONKSİYON
            getCastValue: function () {
                var response = TransactionCaller.sync("ItelliMES/UI/CONSUMPTION_SCREEN/AddCast/T_GET_ADD_CAST", {
                    I_ORDERNO: this.getView().getViewData().mode.split(",")[0],
                    I_OPERATIONNO: this.getView().getViewData().mode.split(",")[1],
                    I_CASTNO: sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualBatch").getValue(),
                },
                    "O_JSON"
                );

                if (response[1] == "E") {
                    MessageBox.error(response[0]);
                    sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idMaterialNo").setValue("");
                    sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualUnit").setValue("");
                    return;
                } else {
                    sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idMaterialNo").setValue(response[0].Rowsets.Rowset.Row["MATNR"] + " - " + response[0].Rowsets.Rowset.Row["MAKTX"]);
                    sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualUnit").setValue(response[0].Rowsets.Rowset.Row["MSEHI"]);
                }
            },

            //EKRANDA MİKTAR DEĞİŞİNCE KONTROL EDEN FONKSİYON
            quantityChange: function (oEvent) {
                var quantity = oEvent.getSource().getValue();
                var selectedIndex = oEvent.oSource.getParent().getBindingContext().getPath().split("/")[4];
                var oTableData = this.getView().byId("idProductsTable").getModel().getData();

                if (quantity == "" || quantity < 0) {
                    oTableData.Rowsets.Rowset.Row[selectedIndex].QTY_IN_REPORT_UOM = 0;
                    this.getView().byId("idProductsTable").getModel().refresh();
                    MessageBox.error("Malzeme miktarı boş bırakılamaz veya negatif değer olamaz");
                    return;
                }
            },

            //Fragment içindeki bilgilerin kontrol edilmesi ve tablodaki modele push edilmesi
            onManualAdd: function () {
                var materialCode = sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idMaterialNo").getValue().split("-")[0].trim().slice(-8);
                var materialDescription = sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idMaterialNo").getValue().split("-")[1].trim();
                var quantity = sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualQuantity").getValue();
                var unitCode = sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualUnit").getValue();
                var batch = sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualBatch").getValue();

                if (!materialCode || !quantity || !unitCode) {
                    MessageBox.error("Lütfen Malzeme No, Miktar ve Birim alanlarını doldurunuz");
                    return;
                }

                if (quantity <= 0) {
                    MessageBox.error("Malzeme miktarı 0 veya negatif değer olamaz");
                    return;
                }

                for (var i = 0; i < this.getView().byId("idProductsTable").getModel()?.getData()?.Rowsets.Rowset.Row.length; i++) {
                    if (this.getView().byId("idProductsTable").getModel()?.getData().Rowsets.Rowset.Row[i].MATNR == materialCode) {
                        MessageBox.error("Tabloda bulunan bir malzemeyi tekrar ekleyemezsiniz");
                        return;
                    }
                }

                //PAÇAL KONTROLÜ
                if (batch != "") {
                    var response = TransactionCaller.sync("ItelliMES/UI/CONSUMPTION_SCREEN/checkBatchNo/T_CHECK_PACALCONFIRM", {
                        I_ORDERNO: this.getView().getViewData().mode.split(",")[0],
                        I_OPERATIONNO: this.getView().getViewData().mode.split(",")[1],
                        I_CASTNO: batch
                    },
                        "O_JSON"
                    );

                    if (response[1] == "E") {
                        MessageBox.error(response[0]);
                        return;
                    }
                }

                //SDM TEYİT KONTROLÜ
                var response = TransactionCaller.sync("ItelliMES/UI/CONSUMPTION_SCREEN/checkSDMConfirm/T_CHECK_SDMCONFIRM", {
                    I_ORDER_NO: this.getView().getViewData().mode.split(",")[0],
                    I_OPERATION_NO: this.getView().getViewData().mode.split(",")[1],
                },
                    "O_JSON"
                );

                if (response[1] == "E") {
                    MessageBox.error(response[0]);
                    return;
                }

                //SIVI ÇELİK EKLERKEN DEPO OLUŞTURULMASI
                if (batch != "") {
                    var response = TransactionCaller.sync("ItelliSTEEL/UI/SendPPCastConf/T_CALL_PP_CASTCONF", {
                        I_CASTNO: batch,
                        I_CASTTON: quantity,
                        I_ISMIXED: "X",
                        I_USER: this.appData.user.userID
                    },
                        "O_JSON"
                    );
                }

                //PARTİNO KONTROLÜ
                var response = TransactionCaller.sync("ItelliMES/UI/CONSUMPTION_SCREEN/Batch_Control/T_GET_XCHPF_MPM_MATMAS_HDR", {
                    I_MATERIAL: materialCode
                },
                    "O_JSON"
                );

                if (response[1] == "E") {
                    var batch = null;
                    var xchpf = false;
                } else {
                    var batch = sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualBatch").getValue()
                    var xchpf = true;
                }

                //MODELE EKLENECEK OBJECT HAZIRLANMASI
                var manualObject = {
                    AUFNR: this.getView().getViewData().mode.split(",")[0],
                    BACKFLUSH: "",
                    BATCH: batch,
                    BDMNG: "",
                    CHARG: "",
                    LGORT: "",
                    MAKTX: materialDescription,
                    MATNR: materialCode,
                    MSEHI: unitCode,
                    PROCESSED: false,
                    QTY_IN_REPORT_UOM: quantity,
                    RSNUM: "",
                    RSPOS: "",
                    VORNR: this.getView().getViewData().mode.split(",")[1],
                    MANUAL: true,
                    XCHPF: xchpf
                };

                //SAYFADAKİ MODELE PUSH EDİLMESİ
                if (this.getView().byId("idProductsTable").getModel()?.getData()?.Rowsets.Rowset.Row != undefined) {
                    this.getView().byId("idProductsTable").getModel()?.getData().Rowsets.Rowset.Row.push(manualObject);
                } else {
                    var obj = { Rowsets: { Rowset: { Row: [] } } };
                    obj.Rowsets.Rowset.Row.push(manualObject);
                    var myModel = this.getView().byId("idProductsTable").getModel();
                    myModel.setData(obj);
                    this.getView().byId("idProductsTable").setModel(myModel);
                }

                this.getView().byId("idProductsTable").getModel().refresh();
                MessageToast.show("Yeni bileşen tabloya eklendi");
                this._oDialog.close();
            },

            //Fragment içinde iptal butonuna basılması
            onManualCancel: function () {
                this._oDialog.close();
            },

            //Ekranda Kaydet butonuna basılması ile verilerin ITE_TT_CONSUMPTION'a gönderilmesi
            saveConsumption: function (oEvent) {
                if (this.getView().byId("idProductsTable").getModel() == undefined) {
                    MessageBox.error("Tabloda tüketim bileşeni bilgisi bulunamadı");
                    return;
                }

                //SDM TEYİT KONTROLÜ
                var response = TransactionCaller.sync("ItelliMES/UI/CONSUMPTION_SCREEN/checkSDMConfirm/T_CHECK_SDMCONFIRM", {
                    I_ORDER_NO: that.getView().getViewData().mode.split(",")[0],
                    I_OPERATION_NO: that.getView().getViewData().mode.split(",")[1],
                },
                    "O_JSON"
                );

                if (response[1] == "E") {
                    MessageBox.error(response[0]);
                    return;
                }

                //TABLO İÇERİĞİNİN TRANSACTIONA GÖRE HAZIRLANMASI
                var tableData = [];
                this.getView().byId("idProductsTable").getModel().getData().Rowsets.Rowset.Row.forEach((index, input) => {
                    tableData.push({
                        AUFNR: index.AUFNR,
                        BACKFLUSH: index.BACKFLUSH,
                        BATCH: index.BATCH,
                        BDMNG: index.BDMNG,
                        CHARG: index.CHARG,
                        LGORT: index.LGORT,
                        MAKTX: index.MAKTX,
                        MANUAL: index.MANUAL,
                        MATNR: index.MATNR,
                        MSEHI: index.MSEHI,
                        QTY_IN_REPORT_UOM: index.QTY_IN_REPORT_UOM,
                        RSNUM: index.RSNUM,
                        RSPOS: index.RSPOS,
                        VORNR: index.VORNR,
                        XCHPF: index.XCHPF,
                        CASTNO: this.getView().getViewData().mode.split(",")[2],
                        NODE_ID: this.appData.node.nodeID
                    });
                });

                //TÜKETİMLERİ SİSTEME KAYDEDEN TRANSACTION
                TransactionCaller.async("ItelliMES/UI/CONSUMPTION_SCREEN/Manuel_Consumption_Send_Consumption/T_MANUEL_MATERIAL_CONSUMPTION",
                    {
                        I_TABLE_DATA: JSON.stringify(tableData),
                        I_ORDER: this.getView().getViewData().mode.split(",")[0],
                        I_OPERATION: this.getView().getViewData().mode.split(",")[1],
                    },
                    "O_JSON",
                    this.saveConsumptionCB,
                    this,
                    "GET"
                );
            },

            saveConsumptionCB: function (iv_data, iv_scope) {
                if (iv_data[1] == "E") {
                    MessageBox.error(iv_data[0]);
                } else {
                    MessageToast.show(iv_data[0]);
                    iv_scope.getData();
                    iv_scope.automationControl();
                    iv_scope.lastSavingTime();
                }
            },

            //Tabloda silme iconuna basılması esnasında veri sadece tabloda kayıtlıysa modelden kaldırıyor
            //veri eğer ITE_TT_CONSUMPTION talosundada kayıtlıysa veri tabanından kaldırılıyor
            onDeleteRow: function (oEvent) {
                var selectedIndex = oEvent.oSource.getParent().getBindingContext().getPath().split("/")[4];
                var oTableData = this.getView().byId("idProductsTable").getModel().getData();
                var materialCode = oTableData.Rowsets.Rowset.Row[selectedIndex].MATNR;

                //SDM TEYİT KONTROLÜ
                var response = TransactionCaller.sync("ItelliMES/UI/CONSUMPTION_SCREEN/checkSDMConfirm/T_CHECK_SDMCONFIRM", {
                    I_ORDER_NO: that.getView().getViewData().mode.split(",")[0],
                    I_OPERATION_NO: that.getView().getViewData().mode.split(",")[1],
                },
                    "O_JSON"
                );

                if (response[1] == "E") {
                    MessageBox.error(response[0]);
                    return;
                }

                var response = TransactionCaller.sync("ItelliMES/UI/CONSUMPTION_SCREEN/DeleteData/T_GET_ITE_TT_CONSUMPTION", {
                    I_ORDER_NO: this.getView().getViewData().mode.split(",")[0],
                    I_OPERATION_NO: this.getView().getViewData().mode.split(",")[1],
                    I_MATERIAL: materialCode,
                },
                    "O_JSON"
                );

                if (response[1] != "E") {
                    MessageBox.confirm("Silme işlemi malzemeyi tablodan tamamen kaldıracaktır\r\n\r\nOnaylıyor musunuz?", {
                        actions: ["Sil", "İptal"],
                        emphasizedAction: "SİL",
                        onClose: function (sAction) {
                            if (sAction == "Sil") {

                                //SDM TEYİT KONTROLÜ KALDIRILACAK
                                var response = TransactionCaller.sync("ItelliMES/UI/CONSUMPTION_SCREEN/DeleteData/T_DELETE_ITE_TT_CONSUMPTION",
                                    {
                                        I_ORDER_NO: that.getView().getViewData().mode.split(",")[0],
                                        I_OPERATION_NO: that.getView().getViewData().mode.split(",")[1],
                                        I_MATERIAL: materialCode,
                                    },
                                    "O_JSON"
                                );

                                if (response[1] == "E") {
                                    MessageBox.error(response[0]);
                                    return;
                                } else {
                                    that.getData();
                                    that.automationControl();
                                    that.lastSavingTime();
                                    MessageToast.show("Malzeme sistemden kaldırıldı");
                                }
                            }
                        },
                    }
                    );
                } else {
                    oTableData.Rowsets.Rowset.Row.splice(selectedIndex, 1);
                    this.getView().byId("idProductsTable").getModel().refresh();
                    MessageToast.show("Malzeme sistemden kaldırıldı");
                }
            },

            navigateToManageOrders: function (oEvent) {
                var origin = location.origin;
                var pathname = location.pathname;
                var hash = "#/activity/Z_MANAGEORDERS_CLK"

                location.href = origin + pathname + hash;
            },

            //Pacal Ekranını Açan Fragment
            getDialog2: function () {
                if (!this.oDialog2) {
                    this.oDialog2 = sap.ui.xmlfragment("consumpiton_PacalScreen",
                        "customActivity.view.fragments.consumpiton_PacalScreen",
                        this
                    );
                    this.getView().addDependent(this.oDialog2);
                }
                return this.oDialog2;
            },

            onPacalScreen: function () {
                this.getDialog2().open();
                this.getPacalRecords(this.getView().getViewData().mode.split(",")[0], this.getView().getViewData().mode.split(",")[1], this.getView().getViewData().mode.split(",")[2]);
            },

            getPacalRecords: function (orderNo, operationNo, castNo) {
                TransactionCaller.async("ItelliMES/UI/CONSUMPTION_SCREEN/getPacalRecords/T_GET_PACAL_COMPONENTS", {
                    I_ORDERNO: orderNo,
                    I_OPERATIONNO: operationNo,
                    I_CASTNO: castNo,
                },
                    "O_JSON",
                    this.getPacalRecordsCB,
                    this
                );
            },

            getPacalRecordsCB: function (iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();
                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    myModel.setData(iv_data[0]);
                } else if (!iv_data[0].Rowsets.Rowset.Row) {
                    myModel.setData(null);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                }

                sap.ui.core.Fragment.byId("consumpiton_PacalScreen", "idPacalTable").setModel(myModel);
            },

            onFragmentCancelPacal: function () {
                this.getDialog2().close();
            },

            //Log Ekranını Açan Fragment
            getDialog: function () {
                if (!this.oDialog) {
                    this.oDialog = sap.ui.xmlfragment("consumption_LogScreen",
                        "customActivity.view.fragments.consumption_LogScreen",
                        this
                    );
                    this.getView().addDependent(this.oDialog);
                }
                return this.oDialog;
            },

            onLogScreen: function () {
                this.getDialog().open();
                this.getLogRecords(this.getView().getViewData().mode.split(",")[2], this.appData.node.nodeID);
            },

            getLogRecords: function (castNo, nodeId) {
                TransactionCaller.async("ItelliMES/UI/CONSUMPTION_SCREEN/getLogRecords/T_GET_ITE_TT_LOG_TRACKING", {
                    I_CASTNO: castNo,
                    I_NODEID: nodeId
                },
                    "O_JSON",
                    this.getLogRecordsCB,
                    this
                );
            },

            getLogRecordsCB: function (iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();
                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    myModel.setData(iv_data[0]);
                } else if (!iv_data[0].Rowsets.Rowset.Row) {
                    myModel.setData(null);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                }

                sap.ui.core.Fragment.byId("consumption_LogScreen", "idLogTable").setModel(myModel);
            },

            onFragmentCancel: function () {
                this.getDialog().close();
            },

            //Kaan Adamey 06.08.2020 fire girişi kod eklemesi
            onAddScrap: function (oEvent) {
                var oButton = oEvent.getSource();
                if (!this._conScreenScrapFragment) {
                    this._conScreenScrapFragment = sap.ui.xmlfragment("Z_SCRAP_INPUT", "customActivity.view.fragments.scrapEntry", this);
                    this.getView().addDependent(this._conScreenScrapFragment);
                }

                //sap.ui.core.Fragment.byId("Z_SCRAP_INPUT", "idScrapFragmentInput").setValue("");
                //sap.ui.core.Fragment.byId("Z_SCRAP_INPUT", "idScrapFragmentInput").setDescription(this.selectedOrderUnit);

                var response = TransactionCaller.sync("ItelliMES/OPERATIONS/Scrap/getTotal/T_GET_MPM_GOODS_MVT_DATA",
                    {
                        I_ORDERNO: this.getView().getViewData().mode.split(",")[0],
                        I_OPERATIONNO: this.getView().getViewData().mode.split(",")[1],
                    },
                    "O_JSON"
                );

                if (response[1] == "E") {
                    MessageBox.error(response[0]);
                    return;
                }

                sap.ui.core.Fragment.byId("Z_SCRAP_INPUT", "idScrapFragmentTotal").setValue(response[0].Rowsets.Rowset.Row.QTY_IN_REPORT_UOM);
                sap.ui.core.Fragment.byId("Z_SCRAP_INPUT", "idScrapFragmentInput").setValue("");
                this._conScreenScrapFragment.openBy(oButton);
            },

            handleCloseButton: function () {
                this._conScreenScrapFragment.close();
            },

            sendScrapQuantity: function () {
                var inputObj = sap.ui.core.Fragment.byId("Z_SCRAP_INPUT", "idScrapFragmentInput");
                var val = inputObj.getValue();
                //this.selectedOrderUnit;

                if (!val || val <= 0) {
                    MessageBox.error("Malzeme miktarı boş bırakılamaz veya negatif değer olamaz");
                    return;
                }

                this._conScreenScrapFragment.setBusyIndicatorDelay(0);
                this._conScreenScrapFragment.setBusy(true);
                TransactionCaller.async("ItelliMES/OPERATIONS/Scrap/T_SendOrderScrap", {
                    orderNumber: this.getView().getViewData().mode.split(",")[0],
                    operationNumber: this.getView().getViewData().mode.split(",")[1],
                    client: this.appData.client,
                    plant: this.appData.plant,
                    quantity: val,
                },
                    "response",
                    this.sendScrapQuantityCB,
                    this,
                    "GET"
                );
            },

            sendScrapQuantityCB: function (iv_data, iv_scope) {
                iv_scope._conScreenScrapFragment.setBusy(false);
                MessageToast.show(iv_data[0]);
                if (iv_data[1] == "S") {
                    iv_scope._conScreenScrapFragment.close();
                }
            },

            onValueHelpRequest: function (oEvent) {
                if (!this._oDialog.isOpen()) {
                    sPath = oEvent.getSource().getBindingContext().getPath();
                }

                if (!this._oValueHelpDialog) {
                    this._oValueHelpDialog = sap.ui.xmlfragment("Z_BATCH_INPUT", "customActivity.view.fragments.batchSelection", this);
                    this.getView().addDependent(this._oValueHelpDialog);
                }
                this._oValueHelpDialog.open();
                this.getScrapBatch();
            },

            getScrapBatch: function () {
                TransactionCaller.async("ItelliMES/UI/CONSUMPTION_SCREEN/ScrapBatch/T_SCRAPBATCH_CHECK",
                    {},
                    "O_JSON",
                    this.getScrapBatchCB,
                    this,
                    "GET"
                );
            },

            getScrapBatchCB: function (iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();
                if (Array.isArray(iv_data[0].ZPP_034_FM_HKOVA_INFO_RFC.TABLES.ET_HURDA_AKTIF.item)) {
                    myModel.setData(iv_data[0]);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].ZPP_034_FM_HKOVA_INFO_RFC.TABLES.ET_HURDA_AKTIF.item);
                    obj_iv_data.ZPP_034_FM_HKOVA_INFO_RFC.TABLES.ET_HURDA_AKTIF.item = dummyData;
                    myModel.setData(obj_iv_data);
                }

                sap.ui.core.Fragment.byId("Z_BATCH_INPUT", "idSelectionBacth").setModel(myModel);
            },

            onValueHelpClose: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (!oSelectedItem) return;

                if (this._oDialog.isOpen()) {
                    sap.ui.core.Fragment.byId("Z_MANUAL_COMPONENT_ADD", "idManualBatch").setValue(oSelectedItem.getTitle());
                } else {
                    this.getView().byId("idProductsTable").getModel().getObject(sPath).BATCH = oSelectedItem.getTitle();
                    this.getView().byId("idProductsTable").getModel().refresh();
                }
            },

            onValueHelpSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter("APARTI", FilterOperator.Contains, sValue);
                oEvent.getSource().getBinding("items").filter([oFilter]);
            },

            //Tabloyu excele aktaran fonksiyon
            createColumnConfig: function () {
                return [
                    {
                        label: 'Sipariş No',
                        property: 'AUFNR',
                        width: '20'
                    },
                    {
                        label: 'Tüketim Teyidi',
                        property: 'PROCESSED',
                        width: '20'
                    },
                    {
                        label: 'Operasyon No',
                        property: 'VORNR',
                        width: '20'
                    },
                    {
                        label: 'Malzeme Kodu',
                        property: 'MATNR',
                        width: '20'
                    },
                    {
                        label: 'Malzeme Tanımı',
                        property: 'MAKTX',
                        width: '30'
                    },
                    {
                        label: 'Planlı Tüketim Miktarı',
                        property: 'BDMNG',
                        width: '20'
                    },
                    {
                        label: 'Gerçek Tüketim Miktarı',
                        property: 'QTY_IN_REPORT_UOM',
                        width: '20'
                    },
                    {
                        label: 'Birim',
                        property: 'MSEHI',
                        width: '20'
                    },
                    {
                        label: 'Parti Numarası',
                        property: 'BATCH',
                        width: '20'
                    }
                ];
            },

            onExport: function () {
                var aCols = this.createColumnConfig();

                if (this.getView().byId("idProductsTable").getModel().getData() == null) {
                    MessageToast.show("Tabloda veri bulunmamaktadır");
                    return;
                }

                var aProducts = this.getView().byId("idProductsTable").getModel().getProperty('/').Rowsets.Rowset.Row;
                var oSettings = { workbook: { columns: aCols }, dataSource: aProducts };

                var oSheet = new Spreadsheet(oSettings);
                oSheet.build().then(function () {
                    MessageToast.show('Tablo Excele Aktarıldı');
                });
            },

            onExport2: function () {
                var aCols = this.createColumnConfig();

                if (sap.ui.core.Fragment.byId("consumpiton_PacalScreen", "idPacalTable").getModel().getData() == null) {
                    MessageToast.show("Tabloda veri bulunmamaktadır");
                    return;
                }

                var aProducts = sap.ui.core.Fragment.byId("consumpiton_PacalScreen", "idPacalTable").getModel().getProperty('/').Rowsets.Rowset.Row;
                var oSettings = { workbook: { columns: aCols }, dataSource: aProducts };

                var oSheet = new Spreadsheet(oSettings);
                oSheet.build().then(function () {
                    MessageToast.show('Tablo Excele Aktarıldı');
                });
            }

        });
    }
);
