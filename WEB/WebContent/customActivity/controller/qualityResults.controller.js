sap.ui.define(
    [
        "sap/m/MessageToast",
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/resource/ResourceModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "customActivity/scripts/transactionCaller",
    ],
    function (
        MessageToast,
        Controller,
        JSONModel,
        ResourceModel,
        Filter,
        FilterOperator,
        TransactionCaller
    ) {
        "use strict";
        var aFiltersComboBox;
        var that;
        return Controller.extend("customActivity.controller.qualityResults", {

            groupsByKeys: {
                1: "USERC2",
                2: "NUMUNE",
                3: "KURZTEXT"
            },

            onInit: function () {
                aFiltersComboBox = [];
                that = this;
                this.getAllQualities();
                this.getAllCastNos();
                //this.onSelectCastNo();
                if (this.getView().getViewData().viewOptions[0].activityOptionValueDTOList.results[0].optionValue == "HADDEHANE") {
                    this.getView().byId("idBilletQualityResults").setVisible(true);
                    this.getBilletTableDynamicColumns();

                }

            },

            setBilletData: function () {
                var response = TransactionCaller.async(
                    "ItelliMES/UI/QUALITY_SCREEN/T_GET_ZQM_SONUC", {},
                    "O_JSON",
                    this.setBilletDataCB,
                    this,
                    "GET"
                );
            },

            setBilletDataCB: function (iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();

                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    myModel.setData(iv_data[0]);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                }
                // let qualityTable = sap.ui.core.Fragment.createId(
                // 	"idqualityresultsfragment",
                // 	"idQualityResultTable"
                // );
                // qualityTable.setModel(myModel);
                iv_scope.getView().byId("idQualityResultTable").setModel(myModel);

                return myModel;
            },

            getAllQualities: function (oEvent) {
                TransactionCaller.async(
                    "ItelliMES/UI/QUALITY_SCREEN/T_GET_ALL_QUALITIES", {

                },
                    "O_JSON",
                    this.getAllQualitiesCB,
                    this,
                    "GET"
                );
            },
            getAllQualitiesCB: function (iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();

                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    myModel.setData(iv_data[0]);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                    myModel.refresh();
                }

                iv_scope.getView().byId("idQuality").setModel(myModel);
            },

            getAllCastNos: function () {
                TransactionCaller.async(
                    "ItelliMES/UI/QUALITY_SCREEN/T_GET_ALL_CASTS", {

                },
                    "O_JSON",
                    this.getAllCastNosCB,
                    this,
                    "GET"
                );
            },
            getAllCastNosCB: function (iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();

                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    myModel.setData(iv_data[0]);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                    myModel.refresh();
                }
                myModel.oData.Rowsets.Rowset?.Row?.sort((a, b) => ((a.ZZ_Y_DOKUM > b.ZZ_Y_DOKUM) ? 1 : ((b.ZZ_Y_DOKUM) > a.ZZ_Y_DOKUM) ? -1 : 0));
                iv_scope.getView().byId("idCastNo").setModel(myModel);
            },

            onSelectCastNo: function (oEvent) {

                TransactionCaller.async(
                    "ItelliMES/UI/QUALITY_SCREEN/T_GET_ALL_CASTS", {

                },
                    "O_JSON",
                    this.onSelectCastNoCB,
                    this,
                    "GET"
                );
            },

            onSelectCastNoCB: function (iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();

                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    myModel.setData(iv_data[0]);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                }

                iv_scope.getView().byId("idCastNo").setModel(myModel);
            },

            onQualityEnter: function (oEvent) {
                var quality = this.getView().byId("idQuality").getSelectedKey();
                if (quality == "") {
                    this.getAllCastNos();
                }
                else if (!!quality) {
                    TransactionCaller.async(
                        "ItelliMES/UI/QUALITY_SCREEN/T_GET_ALL_CASTS_WITH_QUALITY", {
                        I_QUALITY: quality,
                    },
                        "O_JSON",
                        this.onQualityEnterCB,
                        this,
                        "GET"
                    );
                }

            },
            onQualityEnterCB: function (iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();

                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    myModel.setData(iv_data[0]);
                }
                else if (!(!!iv_data[0])) {
                    myModel.setData(null);
                }
                else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                }
                iv_scope.getView().byId("idCastNo").setModel(null);
                
                myModel.oData.Rowsets.Rowset?.Row?.sort((a, b) => ((a.ZZ_Y_DOKUM > b.ZZ_Y_DOKUM) ? 1 : ((b.ZZ_Y_DOKUM) > a.ZZ_Y_DOKUM) ? -1 : 0));
                iv_scope.getView().byId("idCastNo").setModel(myModel);

            },
            onCastNoEnter: function (oEvent) {
                this.getView().byId("idQualityResultTable").setBusy(true);
                var iCastNo = this.getView().byId("idCastNo").getSelectedKey();
                var iQuality = this.getView().byId("idQuality").getSelectedKey();

                TransactionCaller.async(
                    "ItelliMES/UI/QUALITY_SCREEN/T_GET_ZQM_SONUC", {
                    I_CASTNO: iCastNo,
                    I_ZZ_Y_KALITE: iQuality || "",
                },
                    "O_JSON",
                    this.onCastNoEnterCB,
                    this,
                    "GET"
                );

            },

            onCastNoEnterCB: function (iv_data, iv_scope) {
                var myModel = new sap.ui.model.json.JSONModel();

                if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                    myModel.setData(iv_data[0]);
                } else {
                    var obj_iv_data = iv_data[0];
                    var dummyData = [];
                    dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                    obj_iv_data.Rowsets.Rowset.Row = dummyData;
                    myModel.setData(obj_iv_data);
                }

                // iv_scope.getView().byId("idQualityResultTable").setModel(myModel);
                // iv_scope.getView().byId("idQuality").setModel(myModel);
                /*
                var filterComboBoxModel = new JSONModel();
                //iv_scope.byId("filterComboBox").setModel(myModel);

                var facilityAll = [], SampleAll = [], ParameterAll = [];

                for (var i = 0; i < myModel.getData().Rowsets.Rowset.Row.length; i++) {
                    facilityAll[i] = myModel.getData().Rowsets.Rowset.Row[i]?.USERC2;
                    SampleAll[i] = myModel.getData().Rowsets.Rowset.Row[i].NUMUNE;
                    ParameterAll[i] = myModel.getData().Rowsets.Rowset.Row[i].KURZTEXT;
                }

                var facilityUnique = facilityAll.filter((v, i, a) => a.indexOf(v) === i);
                var SampleUnique = SampleAll.filter((v, i, a) => a.indexOf(v) === i);
                var ParameterUnique = ParameterAll.filter((v, i, a) => a.indexOf(v) === i);


                var facilityObj = [], SampleObj = [], ParameterObj = [], filterComboBoxDatas = [];

                for (var i = 0; i < facilityUnique.length; i++) { facilityObj.push({ USERC2: facilityUnique[i] }) };
                filterComboBoxDatas.push(facilityObj);

                for (var i = 0; i < SampleUnique.length; i++) { SampleObj.push({ NUMUNE: SampleUnique[i] }) };
                filterComboBoxDatas.push(SampleObj);

                for (var i = 0; i < ParameterUnique.length; i++) { ParameterObj.push({ KURZTEXT: ParameterUnique[i] }) };
                filterComboBoxDatas.push(ParameterObj);

                var filterComboBoxModel = new JSONModel();
                filterComboBoxModel.setData({ filterComboBox: filterComboBoxDatas });
                */
                //iv_scope.byId("filterComboBox").setModel(filterComboBoxModel);



                //////////////////////////////////////////////////
                myModel.oData.Rowsets.Rowset?.Row?.sort((a, b) => ((a.USERC2 > b.USERC2) ? 1 : ((b.USERC2) > a.USERC2) ? -1 : 0));
                var result = myModel.oData.Rowsets.Rowset.Row;
                var groupResult = [];
                var statusResult = [];
                if (result.length > 1) {
                    var previousUserc2 = "";
                    var previousNumune = "";
                    var row = {};
                    var values = [
                        'C',
                        'Mn',
                        'Si',
                        'S',
                        'P',
                        'Al',
                        'ALINS',
                        'ALSOL',
                        'Cr',
                        'Ni',
                        'Mo',
                        'V',
                        'Ti',
                        'Nb',
                        'B',
                        'Ca',
                        'N',
                        'Cu',
                        'As',
                        'Sn',
                        'Sb',
                        'Cev',
                        'FE',
                        'Zn',
                        'Pb',
                        'Zr'
                    ];
                    var threeFixed = [
                        'C',
                        'Mn',
                        'Si',
                        'S',
                        'P',
                        'Cr'
                    ]
                    var rowStatus = true;
                    var successState = true;
                    var initial = false;
                    for (var i = 0; i < result.length; i++) {

                        if (previousUserc2 == "" && previousNumune == "") {
                            previousUserc2 = result[i].USERC2
                            previousNumune = result[i].NUMUNE
                        }
                        else if (previousUserc2 != result[i].USERC2 || previousNumune != result[i].NUMUNE) {

                            previousUserc2 = result[i].USERC2
                            previousNumune = result[i].NUMUNE;

                            if (!(Object.keys(row).length === 0 && row.constructor === Object)) {
                                groupResult.push(row);
                            }


                            row = {};
                        }
                        else if (previousUserc2 == result[i].USERC2 && previousNumune == result[i].NUMUNE) {
                            continue;
                        }
                        if (!(!!result[i].USERC2)) {
                            continue;
                        }
                        row.USERC2 = result[i].USERC2;
                        row.NUMUNE = result[i].NUMUNE;
                        successState = true;
                        var singleRow = result.filter(item => (item.USERC2 == row.USERC2 && item.NUMUNE == row.NUMUNE));
                        singleRow?.forEach(item => {
                            rowStatus = true;
                            if (values.indexOf(item.KURZTEXT) > -1) {
                                var val = '';
                                if (threeFixed.indexOf(item.KURZTEXT) > -1) {
                                    val = iv_scope.humanize(parseFloat(item.RESULT.toString().replaceAll(',', '.')), 3);
                                }
                                else {
                                    val = iv_scope.humanize(parseFloat(item.RESULT.toString().replaceAll(',', '.')), 4);
                                }
                                row[item.KURZTEXT] = val;
                                row.INSDATE = item.INSDATE;
                                row.INSTIME = item.INSTIME;
                                

                                row.MIN = iv_scope.humanize(parseFloat(item.TOLERANZUN.toString().replaceAll(',', '.')), 4);
                                row.MAX = iv_scope.humanize(parseFloat(item.TOLERANZOB.toString().replaceAll(',', '.')), 4);

                                var labelText = "";
                                labelText = labelText.concat(row.MIN).concat(" - ").concat(row.MAX);
                                var id = item.KURZTEXT.replaceAll(/[()]/g, '');
                                iv_scope.getView().byId(id).setText(labelText);

                                if (row.USERC2.includes('POTA')) {
                                    /*
                                    var statusModel = new sap.ui.model.json.JSONModel();
                                    var status = {};
                                    status.MIN = iv_scope.humanize(parseFloat(item.TOLERANZUN.toString().replaceAll(',','.')),4);
                                    status.MAX = iv_scope.humanize(parseFloat(item.TOLERANZOB.toString().replaceAll(',','.')),4);
                                    statusModel.setData(status);
                                    iv_scope.getView().byId(id.concat('Text')).setModel(statusModel);
                                    */
                                    if ((row.MIN!=0 && row.MAX!=0) && !(row[item.KURZTEXT] >= row.MIN && row[item.KURZTEXT] <= row.MAX) && rowStatus) {
                                        rowStatus = false;
                                        successState = false;
                                        row.STATUS = 'Error'
                                    }

                                }
                                else {
                                    row.STATUS = 'None';
                                }

                            }
                        });
                        if (successState && row.USERC2.includes('POTA')) {
                            row.STATUS = 'Success'
                        }

                    }
                    if (!(Object.keys(row).length === 0 && row.constructor === Object)) {
                        groupResult.push(row);
                    }
                }
                iv_scope.getView().byId("idQualityResultTable").setBusy(false);
                /////////////////////////////////////////////////////
                myModel.setData(groupResult);
                iv_scope.getView().byId("idQualityResultTable").setModel(myModel);
            },
            onBindingChange:function(oEvent){
                this.getView().byId("idQualityResultTable").setVisibleRowCount(oEvent.getSource().getLength());
            },
            humanize: function (x, num) {
                return x.toFixed(num).replace(/\.?0*$/, '');
            },
            onChangeComboFilter: function (oEvent) {

                //var selectedValue = oEvent.getSource().getSelectedItem().getText();
                var selectedValues = [];

                oEvent.getParameter("selectedItems").forEach((index, input) => {

                    selectedValues.push(index.getText());
                })
                var selectedComboBox = this.groupsByKeys[oEvent.getSource().getFieldGroupIds()[0]];
                this.filterOrderVisibility(selectedValues, selectedComboBox);

            },

            //combo box filtresi methodu
            filterOrderVisibility: function (selectedValue, selectedComboBox) {
                var oBinding;
                oBinding = this.getView().byId("idQualityResultTable").getBinding("items");

                // var existingIndex;

                // aFiltersComboBox.forEach((index, input) => {
                //     if(index.sPath==selectedComboBox){
                //         existingIndex=input;
                //     }
                // });

                var existingIndexes = [];

                aFiltersComboBox.forEach((index, input) => {
                    if (index.sPath == selectedComboBox) {
                        existingIndexes.push(input);

                    }
                });

                for (var i = existingIndexes.length - 1; i >= 0; i--) {
                    aFiltersComboBox.splice(existingIndexes[i], 1);
                }
                // if(existingIndexes.length>0){
                // 	existingIndexes.forEach((index,input)=> {
                // 		aFiltersComboBox.splice(index,1);

                // 	})

                // }

                if (Array.isArray(selectedValue)) {

                    selectedValue.forEach((index, input) => {

                        aFiltersComboBox.push(
                            new Filter(
                                selectedComboBox,
                                sap.ui.model.FilterOperator.EQ,
                                index
                            )
                        );

                    })
                } else {

                    aFiltersComboBox.push(
                        new Filter(
                            selectedComboBox,
                            sap.ui.model.FilterOperator.EQ,
                            selectedValue
                        )
                    );

                }

                // aFiltersComboBox.push(
                // 	new Filter(
                // 		selectedComboBox,
                // 		sap.ui.model.FilterOperator.EQ,
                // 		selectedValue
                // 	)
                // );

                oBinding?.filter(aFiltersComboBox, sap.ui.model.FilterType.Application);
            },

            // onChangeComboFilter: function (oEvent) {
            // 	// build filter array
            // 	var selectedValues = [];
            // 	var sQuery = oEvent.getParameter("");
            // 	if (sQuery) {
            // 		selectedValues.push(
            // 			new Filter("Parametre", FilterOperator.Contains, sQuery)
            // 		);
            // 	}

            // 	// filter binding
            // 	var oList = this.byId("idQualityResultTable");
            // 	var oBinding = oList.getBinding("items");
            // 	oBinding.filter(selectedValues);
            // },

            getBilletTableDynamicColumns: function () {
                this._dynamicCharList = TransactionCaller.sync(
                    "ItelliMES/UI/QUALITY_SCREEN/Khh_BilletQualityResults/T_GetQualityResultsFromCastNo",
                    {
                        I_CASTNO: "2015446",
                    },

                    "O_JSON"
                );

                if (
                    this._dynamicCharList[1] == "S" &&
                    !!this._dynamicCharList[0].Rowsets.Rowset[0].Row
                ) {
                    this._dynamicCharList[0].Rowsets.Rowset[0].Row = Array.isArray(
                        this._dynamicCharList[0].Rowsets.Rowset[0].Row
                    )
                        ? this._dynamicCharList[0].Rowsets.Rowset[0].Row
                        : new Array(this._dynamicCharList[0].Rowsets.Rowset[0].Row);

                    //this._dynamicCharList[0].Rowsets.Rowset?.Row?.forEach(
                    debugger;
                    this._dynamicCharList[0].Rowsets.Rowset[0].Row.forEach(
                        (item, index) => {
                            let labelObj = new sap.m.Label();
                            //labelObj.setText(item?.KURZTEXT);
                            labelObj.setText("1");
                            let textObj = new sap.m.Text();
                            //textObj.bindProperty("text", item?.KURZTEXT);
                            textObj.bindProperty("text", "1");

                            // var oColumnTemplate = new sap.ui.table.Column({
                            // 	label : "{123}",
                            // 	template : new sap.ui.commons.TextView().bindProperty("text", textObj)
                            // });
                            var oTable = this.getView().byId("idBilletQualityResults");
                            oTable.addColumn(new sap.ui.table.Column({
                                label: labelObj,
                                width: "300px",
                                template: new sap.ui.commons.TextView().bindProperty("text", textObj)
                            }));

                            // oTable.bindColumns("/columns", oColumnTemplate);
                            // oTable.bindRows("/rows");

                            // this.getView()
                            // 	.byId("idBilletQualityResults")
                            // 	.addColumn(new sap.m.Column({ header: labelObj }));
                            // this.getView().byId("idBilletQualityResults").addCell(textObj);
                        },
                        this
                    );

                    this.getView().byId("idBilletQualityResults").rerender();
                    //	this.getBilletTableDynamicDatas();
                }

            },

            getBilletTableDynamicDatas: function () {

                var dummyArr = [];
                //dummyArr.push({"1":"test",2:"test2","dummy":"dummy","3":"test3"});
                var myModel = new sap.ui.model.json.JSONModel();
                myModel.setData(dummyArr);
                this.getView().byId("idBilletQualityResults").setModel(myModel);

                // var response = TransactionCaller.async(
                // 	"ItelliMES/UI/QUALITY_SCREEN/Khh_BilletQualityResults/T_GetQualityResultsFromCastNoDynamically", {
                // 		I_CASTNO: "2015446",
                // 	},
                // 	"O_JSON",
                // 	this.getBilletTableDynamicDatasCB,
                // 	this,
                // 	"GET"
                // );

            },
            getBilletTableDynamicDatasCB: function (iv_data, iv_scope) {
                // var myModel = new sap.ui.model.json.JSONModel();

                // if (Array.isArray(iv_data[0].Rowsets.Rowset[0].Row[0])) {
                // 	myModel.setData(iv_data[0].Rowsets.Rowset[0].Row[0]);
                // } else {
                // 	var obj_iv_data = iv_data[0];
                // 	var dummyData = [];
                // 	dummyData.push(iv_data[0].Rowsets.Rowset[0].Row[0]);
                // 	obj_iv_data.Rowsets.Rowset[0].Row[0] = dummyData;
                // 	myModel.setData(obj_iv_data);
                // }
                // iv_scope.getView().byId("idBilletQualityResults").setModel(myModel);


            }
        });
    }
);