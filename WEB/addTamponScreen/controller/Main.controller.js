/* global sap,$,_ */
sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageToast",
        "sap/m/MessageBox",
        "addTamponScreen/scripts/transactionCaller",
        "sap/m/Dialog",
        "sap/m/Text",
        "sap/m/TextArea",
        "sap/m/Button",
        "sap/m/DialogType",
        "sap/m/ButtonType",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
    ],
    function (
        Controller,
        JSONModel,
        MessageToast,
        MessageBox,
        TransactionCaller,
        Dialog,
        Text,
        TextArea,
        Button,
        DialogType,
        ButtonType,
        Filter,
        FilterOperator
    ) {
        "use strict";
        /* jshint -W061 */
        var that = this;
        var SFC;
        var OPERATION;
        var SITE;
        var TAMPON_ID;

        return Controller.extend("addTamponScreen.controller.Main", {
            onInit: function () {
                this.inputControl = [
                    "tamponStartTimeId",
                    "tamponEndTimeId",
                    "wastedTimeId",
                    "machineSpeedId",
                    "raspaChangeId",
                    "qualityScraptTypeId",
                    "tamponWeightId",
                    "tamponWidthId",
                    "bobinWidthId",
                    "lengthId",
                    "controlUsageQUantityId",
                    "otherScraptTypeId"
                ];
                this.setInitialDatas();
                this.onQualityWasteChange();
                this.onWasteChange();
            },

            setInitialDatas: function () {
                SFC = jQuery.sap.getUriParameters().get("SFC");
                OPERATION = jQuery.sap.getUriParameters().get("OPERATION");
                SITE = jQuery.sap.getUriParameters().get("SITE");
                TAMPON_ID = jQuery.sap.getUriParameters().get("TAMPON_ID");
                this.ME_CONF_COUNT = jQuery.sap.getUriParameters().get("ME_CONF_COUNT");
                // TAMPON_ID ="T2668";


                if (SFC == "" || OPERATION == null) {
                    MessageBox.show(
                        "Tampon olusturmak icin siparis ve operasyon secimi yapiniz"
                    );
                    return;
                }

                if (TAMPON_ID != null) {
                    this.firstCheck = 1;
                    this.getView().byId("idTitleText").setText(TAMPON_ID + " Numaralı Tampon Düzenleme Ekranı");
					this.getSfcDetails(SFC);
                    this.getTamponDetailsFromTamponId(TAMPON_ID);
                    this.getQualityNcCodesForComboBox();
                    this.getView().byId("tamponChangeButton").setVisible(true);
                    this.getView().byId("tamponCreateButton").setVisible(false);
                    // this.setDateFunction();

                } else {

                    this.getSfcDetails(SFC);
                    this.getQualityNcCodesForComboBox();
                    this.setDateFunction();
                    this.getTotalCountOfScrapts();
                    this.getView().byId("tamponChangeButton").setVisible(false);
                    this.getView().byId("tamponCreateButton").setVisible(true);
                }
            },

            /////////////////DUZENLEME FONKSIYONLARI BASLANGICI 18042021 ////////////////
            getTamponDetailsFromTamponId: function (tampon_id) {
                TransactionCaller.async(
                    "ECZ_MES-4.0/KAGIT/INVENTORY_LIST/getInvFromSfcAddTamponScreen/T_GetInventoryListFromInvId",
                    {
                        I_TAMPON_ID: tampon_id,

                    },
                    "O_JSON",
                    this.getTamponDetailsFromTamponIdCB,
                    this
                );



            },
            getTamponDetailsFromTamponIdCB: function (iv_data, iv_scope) {
                iv_scope.tamponGiris = new Date(iv_data[0].Rowsets.Rowset.Row.TAMPON_GIRIS);
                iv_scope.tamponCikis = new Date(iv_data[0].Rowsets.Rowset.Row.TAMPON_CIKIS);

                iv_scope
                    .getView()
                    .byId("totalQualityScraptId")
                    .setValue(iv_data[0].Rowsets.Rowset.Row.NC_GROUP001);
                iv_scope
                    .getView()
                    .byId("totalOtherScraptId")
                    .setValue(iv_data[0].Rowsets.Rowset.Row.NC_GROUP002);

                if (iv_scope.firstCheck == 1) {
					if(iv_data[0].Rowsets.Rowset.Row.QTY_ON_HAND  != 0){
                    iv_scope
                        .getView()
                        .byId("tamponWeightId")
                        .setValue(iv_data[0].Rowsets.Rowset.Row.QTY_ON_HAND + iv_data[0].Rowsets.Rowset.Row.NC_GROUP002 + iv_data[0].Rowsets.Rowset.Row.NC_GROUP001);

					}else{
						iv_scope
                        .getView()
                        .byId("tamponWeightId")
                        .setValue(iv_data[0].Rowsets.Rowset.Row.ORIGINAL_QTY+ iv_data[0].Rowsets.Rowset.Row.NC_GROUP003 +
                            iv_data[0].Rowsets.Rowset.Row.NC_GROUP002 + iv_data[0].Rowsets.Rowset.Row.NC_GROUP001);

					}

                    iv_scope
                        .getView()
                        .byId("tamponWidthId")
                        .setValue(iv_data[0].Rowsets.Rowset.Row.TAMPON_GENISLIGI);
                  

                    iv_scope
                        .getView()
                        .byId("bobinWidthId").setValue(iv_data[0].Rowsets.Rowset.Row.BOBIN_GENISLIGI);
						iv_scope
                        .getView()
                        .byId("raspaChangeId").setValue(iv_data[0].Rowsets.Rowset.Row.RASPADEGISIMI);
						iv_scope
                        .getView()
                        .byId("wastedTimeId").setValue(iv_data[0].Rowsets.Rowset.Row.BOSAAKMA);
						iv_scope
                        .getView()
                        .byId("lengthId").setValue(iv_data[0].Rowsets.Rowset.Row.TAMPONUZUNLUGU);


                    iv_scope
                        .getView()
                        .byId("totalQualityScraptId").setEditable(true);
                    iv_scope
                        .getView()
                        .byId("totalOtherScraptId").setEditable(true);
                    
                }
				iv_scope
				.getView()
				.byId("tamponStartTimeId").setDateValue(iv_scope.tamponGiris);

			iv_scope
				.getView()
				.byId("tamponEndTimeId").setDateValue(iv_scope.tamponCikis);
				iv_scope.firstCheck = 1;

            },

            setDateFunction: function () {
                var date = new Date();
                var yesterday = new Date();
                var today = new Date();
                yesterday.setDate(date.getDate() - 1);
                today.setDate(date.getDate());
                this.getView().byId("tamponStartTimeId").setDateValue(yesterday);
                this.getView().byId("tamponEndTimeId").setDateValue(today);
            },

            onQualityWasteChange: function () {
                var qualityCode = this.getView().byId("qualityScraptTypeId").getSelectedKey();
                this.getView().byId("qualityScraptId").setEnabled(!!qualityCode);
            },

            onWasteChange: function () {
                var qualityCode = this.getView().byId("otherScraptTypeId").getSelectedKey();
                this.getView().byId("otherScraptId").setEnabled(!!qualityCode);
            },

            createTamponId: function (inputJsonData, jsonScraptDatas) {

                if (TAMPON_ID != null) {

                    var response = TransactionCaller.sync(
                        "ECZ_MES-4.0/KAGIT/TAMPON_CREATE/MAIN_TRANSACTION/T_MainTransactionForTamponCreate",
                        {
                            I_TAMPON_ID: TAMPON_ID,
                            I_JSON_DATA: JSON.stringify(inputJsonData),
                            I_SCRAPT_DATA: JSON.stringify(jsonScraptDatas),
                        },
                        "O_JSON"
                    );
                    // this.setDateFunction();

                } else {


                    var response = TransactionCaller.sync(
                        "ECZ_MES-4.0/KAGIT/TAMPON_CREATE/MAIN_TRANSACTION/T_MainTransactionForTamponCreate",
                        {
                            I_JSON_DATA: JSON.stringify(inputJsonData),
                            I_SCRAPT_DATA: JSON.stringify(jsonScraptDatas),
                        },
                        "O_JSON"
                    );
                }

                if (response[1] == "E") {
                    MessageBox.show("Hata mesaji: " + response[0]);
                } else if (response[1] == "S") {
                    MessageBox.show(response[0]);
                    this.confirmSeconds = 3;
                    this.cTrigger = new sap.ui.core.IntervalTrigger(1000);
                    this.cTrigger.addListener(() => {
                        this.confirmSeconds = this.confirmSeconds - 1;
                        if (this.confirmSeconds == 0) {
                            this.cTrigger.destroy();
                            window.parent.document.getElementById("templateForm:popupWindow-close").click();
                        }
                    }, this);

                }
            },

            getSfcDetails: function (selectedSfc) {
                TransactionCaller.async(
                    "ECZ_MES-4.0/KAGIT/TAMPON_CREATE/SFC_INFORMATION/T_GetSfcInformation",
                    {
                        I_SITE: SITE,
                        I_SFC: selectedSfc,
                    },
                    "O_JSON",
                    this.getSfcDetailsCB,
                    this
                );
            },
            getSfcDetailsCB: function (iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();
                if (Array.isArray(iv_data[0])) {
                    myModel.setData(iv_data[0]);
                } else if (!iv_data[0]) {
                    myModel.setData(null);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0]);
                    obj_iv_data = dummyData;
                    myModel.setData(obj_iv_data);
                }

                iv_scope
                    .getView()
                    .byId("sfcNoField")
                    .setText(
                        iv_data[0].serviceInvocationResponses.serviceInvocationResponse
                            .responses.sfc
                    );
                iv_scope
                    .getView()
                    .byId("orderNoField")
                    .setText(
                        iv_data[0].serviceInvocationResponses.serviceInvocationResponse.responses.shopOrderRef.split(
                            ","
                        )[1]
                    );

                if (
                    iv_data[0].serviceInvocationResponses.serviceInvocationResponse.responses.statusRef == "IN_WORK"
                ) {
                    iv_scope.getView().byId("sfcStatusField").setText("AKTIF");
                    iv_scope.inputControl.forEach((item) => {
                        iv_scope.getView().byId(item).setEnabled(true);
                    }, iv_scope)

                } else {
                    iv_scope.getView().byId("sfcStatusField").setText("PASIF");
                    iv_scope.inputControl.forEach((item) => {
                        iv_scope.getView().byId(item).setEnabled(false);
                    }, iv_scope)

                    MessageToast.show(
                        "Başlatılmayan siparişler için tampon oluşturulamaz."
                    );
                }

                iv_scope.getView().byId("operationFieldId").setText(OPERATION);

                //mile sarma anaveri kontrolu

                // if (iv_data[0].serviceInvocationResponses.customData?.find((o) => o.name == "Z_MIL_CHECK").value) {
                if (iv_data[0].serviceInvocationResponses.customData?.value == "004") {

                    //  if (iv_data[0].serviceInvocationResponses.customData?.find((o) => o.name == "Z_MIL_CHECK").value) {


                    iv_scope.getView().byId("milIndicatorCheckboxId").setSelected(true);
                    iv_scope.getView().byId("bobinWidthId").setEditable(true);
                }

                //MachineParams
                if (iv_data[0].serviceInvocationResponses.Result.HIZ != null) {
                    iv_scope.getView().byId("machineSpeedId").setValue(iv_data[0].serviceInvocationResponses.Result.HIZ);
                }
                if (iv_data[0].serviceInvocationResponses.Result?.TAMPONGENISLIKMAX != null) {
                    iv_scope.getView().byId("maxTamponGenislikFieldId").setText(iv_data[0].serviceInvocationResponses.Result?.TAMPONGENISLIKMAX);
                }

			

				if (TAMPON_ID == null) {

                if (iv_data[0].serviceInvocationResponses.Result?.TAMPONENDTIME != null) {
                    var tamponGiris = new Date(iv_data[0].serviceInvocationResponses.Result?.TAMPONENDTIME);
                    iv_scope
                    .getView()
                    .byId("tamponStartTimeId").setDateValue(tamponGiris);

                 }

				}
            

            },

            fillScreenDatasToArray: function () {
                // var tamponStartTimeId = this.getView()
                //     .byId("tamponStartTimeId")
                //     .getDateValue()
                //     .toISOString();

                var tamponStartTimeId = new Date(this.getView()
                    .byId("tamponStartTimeId")
                    .getDateValue().getTime() - (this.getView()
                        .byId("tamponStartTimeId")
                        .getDateValue().getTimezoneOffset() * 60000)).toISOString()

                var tamponWeightId = this.getView().byId("tamponWeightId").getValue();
                var machineSpeedId = this.getView().byId("machineSpeedId").getValue();
                var qualityScraptTypeId = this.getView()
                    .byId("qualityScraptTypeId")
                    .getValue();
                var raspaChangeId = this.getView().byId("raspaChangeId").getValue();
                var tamponWidthId = this.getView().byId("tamponWidthId").getValue();
                var raspaTypeId = ""; //this.getView().byId("raspaTypeId").getValue();
                var tamponWeightId = this.getView().byId("tamponWeightId").getValue();
                var barcodePrintCheckBoxId = ""; // this.getView().byId("barcodePrintCheckBoxId").getSelected();

                // var tamponEndTimeId = this.getView()
                //     .byId("tamponEndTimeId")
                //     .getDateValue()
                //     .toISOString();


                var tamponEndTimeId = new Date(this.getView()
                    .byId("tamponEndTimeId")
                    .getDateValue().getTime() - (this.getView()
                        .byId("tamponEndTimeId")
                        .getDateValue().getTimezoneOffset() * 60000)).toISOString()

                if (tamponStartTimeId >= tamponEndTimeId) {

                    MessageBox.show("Başlangıç tarihi bitiş tarihinden sonra olamaz.");
                    return;

                }
                var otherScraptId = this.getView().byId("otherScraptId").getValue();
                var qualityScraptId = this.getView().byId("qualityScraptId").getValue();
                var wastedTimeId = this.getView().byId("wastedTimeId").getValue();
                var lengthId = this.getView().byId("lengthId").getValue();
                var raspaAngleId = ""; // this.getView().byId("raspaAngleId").getValue();
                var controlUsageQUantityId = this.getView()
                    .byId("controlUsageQUantityId")
                    .getValue();
                var bobinWidthId = this.getView().byId("bobinWidthId").getValue(); // this.getView().byId("milIndicatorCheckboxId").getSelected();
                var orderNoField = this.getView().byId("orderNoField").getText();
                var sfcNoField = this.getView().byId("sfcNoField").getText();
                var sfcStatusField = this.getView().byId("sfcStatusField").getText();
                var operationFieldId = this.getView()
                    .byId("operationFieldId")
                    .getText();
                var milIndicatorCheckboxId = this.getView()
                    .byId("milIndicatorCheckboxId")
                    .getSelected();
                milIndicatorCheckboxId = !!milIndicatorCheckboxId ? "X" : " ";

                var jsonDataforInputs = [];

                jsonDataforInputs.push({
                    Site: SITE,
                    tamponStartTimeId: tamponStartTimeId,
                    tamponWeightId: tamponWeightId,
                    machineSpeedId: machineSpeedId,
                    qualityScraptTypeId: qualityScraptTypeId,
                    raspaChangeId: raspaChangeId,
                    tamponWidthId: tamponWidthId,
                    raspaTypeId: raspaTypeId,
                    tamponWeightId: tamponWeightId,
                    barcodePrintCheckBoxId: barcodePrintCheckBoxId,

                    tamponEndTimeId: tamponEndTimeId,
                    otherScraptId: otherScraptId,
                    qualityScraptId: qualityScraptId,
                    wastedTimeId: wastedTimeId,
                    lengthId: lengthId,
                    raspaAngleId: raspaAngleId,
                    controlUsageQUantityId: controlUsageQUantityId,
                    bobinWidthId: bobinWidthId,

                    orderNoField: orderNoField,
                    sfcNoField: sfcNoField,
                    sfcStatusField: sfcStatusField,
                    operationFieldId: operationFieldId,
                    milIndicatorCheckboxId: milIndicatorCheckboxId,
                });

                var jsonScraptDatas = [];
                // nc code and quantity finding
                var qualityScraptTypeId = this.getView()
                    .byId("qualityScraptTypeId")
                    .getSelectedKey();
                var otherScraptTypeId = this.getView()
                    .byId("otherScraptTypeId")
                    .getSelectedKey();
                var otherScraptId =
                    this.getView().byId("otherScraptId").getValue() / 1000;
                var qualityScraptId =
                    this.getView().byId("qualityScraptId").getValue() / 1000;
                var operationFieldId = this.getView()
                    .byId("operationFieldId")
                    .getText();

                var sfcNoField = this.getView().byId("sfcNoField").getText();
                var operationFieldId = this.getView()
                    .byId("operationFieldId")
                    .getText();

                var jsonScraptDatas = [];
                jsonScraptDatas.push({
                    scraptType: qualityScraptTypeId,
                    quantity: qualityScraptId,
                });

                jsonScraptDatas.push({
                    scraptType: otherScraptTypeId,
                    quantity: otherScraptId,
                });

                this.createTamponId(jsonDataforInputs, jsonScraptDatas);
                //this.createTamponId(SFC,tamponQuantity);
            },

            getQualityNcCodesForComboBox: function () {
                TransactionCaller.async(
                    "ECZ_MES-4.0/KAGIT/TAMPON_CREATE/NC_CODE_FOR_DESE/T_GetNCodesFromNcGroup",
                    {
                        I_SITE: SITE,
                    },
                    "O_JSON",
                    this.getQualityNcCodesForComboBoxCB,
                    this
                );
            },

            getQualityNcCodesForComboBoxCB: function (iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();

                if (Array.isArray(iv_data[0])) {
                    myModel.setData(iv_data[0]);
                } else if (!iv_data[0]) {
                    myModel.setData(null);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0]);
                    obj_iv_data = dummyData;
                    myModel.setData(obj_iv_data);
                }

                iv_scope.getView().byId("qualityScraptTypeId").setModel(myModel);
                iv_scope.getView().byId("otherScraptTypeId").setModel(myModel);

                iv_scope.modelFilter("ncGroup", "qualityScraptTypeId", "NC_GROUP001");
                iv_scope.modelFilter("ncGroup", "otherScraptTypeId", "NC_GROUP002");
            },

            modelFilter: function (filterName, objectId, filterId) {
                var oBinding;
                oBinding = this.getView().byId(objectId).getBinding("items");

                var aFilters = [];

                aFilters.push(
                    new Filter(filterName, sap.ui.model.FilterOperator.EQ, filterId)
                );

                oBinding?.filter(aFilters, sap.ui.model.FilterType.Application);
            },

            onPressScraptSaveButton: function () {

                if (this.getView().byId("tamponWeightId").getValue() == "") {
                    MessageBox.error("Lütfen tampon ağırlığı giriniz.");
                    //this.getView().byId("idDeseButton").setEnabled(false);

                    return;
                }
                // nc code and quantity finding miktarlar tona cevrilerek gonderildi
                var qualityScraptTypeId = this.getView()
                    .byId("qualityScraptTypeId")
                    .getSelectedKey();
                var otherScraptTypeId = this.getView()
                    .byId("otherScraptTypeId")
                    .getSelectedKey();
                var otherScraptId =
                    this.getView().byId("otherScraptId").getValue() / 1000;
                var qualityScraptId =
                    this.getView().byId("qualityScraptId").getValue() / 1000;
                var operationFieldId = this.getView()
                    .byId("operationFieldId")
                    .getText();

                var sfcNoField;


                //tampn düzenleme için eklendi 18042021 bince
                if (TAMPON_ID != null) {
                    sfcNoField = TAMPON_ID;
                } else {
                    var sfcNoField = this.getView().byId("sfcNoField").getText();

                }
                var operationFieldId = this.getView()
                    .byId("operationFieldId")
                    .getText();

                var jsonDataforInputs = [];
                jsonDataforInputs.push({
                    scraptType: qualityScraptTypeId,
                    quantity: qualityScraptId,
                });

                jsonDataforInputs.push({
                    scraptType: otherScraptTypeId,
                    quantity: otherScraptId,
                });

                TransactionCaller.async(
                    "ECZ_MES-4.0/KAGIT/TAMPON_CREATE/NC_CODE_FOR_DESE/LOG_NC/T_logNC",
                    {
                        I_SFC: sfcNoField,
                        I_OPERATION: operationFieldId,
                        I_DATA: JSON.stringify(jsonDataforInputs),
                    },
                    "O_JSON",
                    this.onPressScraptSaveButtonCB,
                    this
                );


            },

            onPressScraptSaveButtonCB: function (iv_data, iv_scope) {
                //alert(iv_data[0]);

                iv_scope.getView().byId("qualityScraptTypeId").setSelectedKey("");
                iv_scope.getView().byId("otherScraptTypeId").setSelectedKey("");
                iv_scope.getView().byId("otherScraptId").setValue("");
                iv_scope.getView().byId("qualityScraptId").setValue("");

                if (TAMPON_ID != null) {

                    iv_scope.getTamponDetailsFromTamponId(TAMPON_ID);

                } else {

                    iv_scope.getTotalCountOfScrapts();
                }
				iv_scope.firstCheck = 0;
            },

            getTotalCountOfScrapts: function () {
                TransactionCaller.async(
                    "ECZ_MES-4.0/KAGIT/TAMPON_CREATE/NC_CODE_FOR_DESE/FIND_NC_QUANTITY/T_FindAllNcQuantitiesFromSfc",
                    {
                        I_SFC: SFC,
                    },
                    "O_JSON",
                    this.getTotalCountOfScraptsCB,
                    this
                );
            },

            getTotalCountOfScraptsCB: function (iv_data, iv_scope) {
                // alert(iv_data[0])

                iv_scope
                    .getView()
                    .byId("totalQualityScraptId")
                    .setValue(iv_data[0].ResultCount.NC_GROUP001 * 1000);
                iv_scope
                    .getView()
                    .byId("totalOtherScraptId")
                    .setValue(iv_data[0].ResultCount.NC_GROUP002 * 1000);
            },





            onPressScraptListButton: function (oEvent) {
                if (!this._oDialogScraptList) {
                    this._oDialogScraptList = sap.ui.xmlfragment(
                        "Z_Scrapt_List",
                        "addTamponScreen.view.fragments.scraptList",
                        this
                    );

                    this.getView().addDependent(this._oDialogScraptList);
                }

                this._oDialogScraptList.open();
                this.getAllNcListFromSfc();

            },


            getAllNcListFromSfc: function () {


                if (TAMPON_ID != null) {

                    this.dummySfc = TAMPON_ID;

                } else {

                    this.dummySfc = SFC;
                }


                TransactionCaller.async(
                    "ECZ_MES-4.0/KAGIT/TAMPON_CREATE/FIND_NC_LOG_FROM_SFC/T_GetNcLogListFromSfc", {
                    I_SFC: this.dummySfc,
                },
                    "O_JSON",
                    this.getAllNcListFromSfcCB,
                    this,
                    "GET", {}
                );
            },

            getAllNcListFromSfcCB: function (iv_data, iv_scope) {
                var oModel = new sap.ui.model.json.JSONModel();

                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    oModel.setData(iv_data[0]);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    oModel.setData(obj_iv_data);
                }

                sap.ui.core.Fragment.byId(
                    "Z_Scrapt_List",
                    "idScraptTable"
                ).setModel(oModel);

            },
            onDeleteScraptButton: function () {

                var sIndex = sap.ui.core.Fragment.byId(
                    "Z_Scrapt_List",
                    "idScraptTable"
                ).getSelectedContextPaths()[0].split("/")[4];

                var selectedLine = sap.ui.core.Fragment.byId(
                    "Z_Scrapt_List",
                    "idScraptTable"
                ).getModel().getData().Rowsets.Rowset.Row[sIndex];




                TransactionCaller.async(
                    "ECZ_MES-4.0/KAGIT/TAMPON_CREATE/FIND_NC_LOG_FROM_SFC/T_DeleteNcForSfc",
                    {
                        I_SFC: this.dummySfc,
                        I_NC_CODE: selectedLine.NC_CODE_BO,
                        I_QTY: selectedLine.QTY / 1000,
                        I_SITE: SITE,

                    },
                    "O_JSON",
                    this.onDeleteScraptButtonCB,
                    this
                );


            },

            onDeleteScraptButtonCB: function (iv_data, iv_scope) {

                MessageToast.show(iv_data[0]);

                if (TAMPON_ID != null) {
					iv_scope.firstCheck = 0;

                    iv_scope.getTamponDetailsFromTamponId(TAMPON_ID);
                    iv_scope.getSfcDetails(SFC);
                    iv_scope.getQualityNcCodesForComboBox();
                    // this.setDateFunction();

                } else {

                    iv_scope.getSfcDetails(SFC);
                    iv_scope.getQualityNcCodesForComboBox();
                    iv_scope.setDateFunction();
                    iv_scope.getTotalCountOfScrapts();
                }


                //iv_scope.getAllNcListFromSfc();
                iv_scope._oDialogScraptList.close();

            },
            onCancelScraptButton: function () {
                this._oDialogScraptList.close();

            },
            onPressTamponCreateButton: function () {

                if (this.getView().byId("tamponWeightId").getValue() == "") {
                    MessageBox.error("Lütfen tampon ağırlığı giriniz.");

                    return;
                }

                if (this.getView().byId("tamponWidthId").getValue() == "") {
                    MessageBox.error("Lütfen tampon genişliği giriniz.");

                    return;
                }

                if (this.getView().byId("tamponWidthId").getValue() > this.getView().byId("maxTamponGenislikFieldId").getText()
                    && this.getView().byId("maxTamponGenislikFieldId").getText() != "") {
                    MessageBox.error("Tampon Genişligi " + this.getView().byId("maxTamponGenislikFieldId").getText() + " cm değerinden büyük olamaz");

                    return;
                }

                if (this.getView().byId("milIndicatorCheckboxId").getSelected() == true) {

                    if (this.getView().byId("bobinWidthId").getValue() == "") {
                        MessageBox.error("Lütfen bobin genişliği giriniz.");

                        return;
                    }
                    if (Number(this.getView().byId("tamponWidthId").getValue()) < Number(this.getView().byId("bobinWidthId").getValue())) {
                        MessageBox.error("Bobin genişliği tampon genişliğinden büyük olamaz.");

                        return;
                    }

                }

                if ((this.getView().byId("otherScraptTypeId").getSelectedKey() != "") && (this.getView().byId("otherScraptId").getValue() == "")) {
                    MessageBox.error("Diğer deşe miktarı boş bırakılamaz.");

                    return;
                }
                if ((this.getView().byId("otherScraptTypeId").getSelectedKey() != "") && (this.getView().byId("InformationAreaId").getValue() == "")) {
                    MessageBox.error("Açıklama alanı boş bırakılamaz.");

                    return;
                }

                if ((Number(this.getView().byId("totalQualityScraptId").getValue()) != "") && (this.getView().byId("InformationAreaId").getValue() == "")) {
                    MessageBox.error("Açıklama alanı boş bırakılamaz..");
                    return;
                }

                if ((Number(this.getView().byId("totalOtherScraptId").getValue()) != "") && (this.getView().byId("InformationAreaId").getValue() == "")) {
                    MessageBox.error("Açıklama alanı boş bırakılamaz..");
                    return;
                }


                if ((this.getView().byId("qualityScraptTypeId").getSelectedKey() != "") && (this.getView().byId("qualityScraptId").getValue() == "")) {
                    MessageBox.error("Kalite deşesi miktarı boş bırakılamaz.");
                    return;
                }

                if ((this.getView().byId("qualityScraptTypeId").getSelectedKey() != "") && (this.getView().byId("InformationAreaId").getValue() == "")) {
                    MessageBox.error("Açıklama alanı boş bırakılamaz.");
                    return;
                }


                if (this.getView().byId("sfcStatusField").getText() != "AKTIF") {
                    MessageBox.show("Aktif olmayan siparis icin tampon yaratamazsınız!");
                    return;
                }

                if (!this.oApproveDialog) {
                    this.oApproveDialog = new Dialog({
                        type: DialogType.Message,
                        title: "Confirm",
                        content: new Text({ text: "Tampon oluşturma işlemini onaylıyor musunuz?" }),
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "Submit",
                            press: function () {
                                var tamponQuantity = this.getView()
                                    .byId("tamponWeightId")
                                    .getValue();
                                this.fillScreenDatasToArray();
                                //  MessageToast.show("Submit pressed!");
                                this.oApproveDialog.close();
                            }.bind(this),
                        }),
                        endButton: new Button({
                            text: "Cancel",
                            press: function () {
                                this.oApproveDialog.close();
                            }.bind(this),
                        }),
                    });
                }

                this.oApproveDialog.open();



            },
        });
    }
);
