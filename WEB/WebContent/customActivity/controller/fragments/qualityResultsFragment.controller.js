sap.ui.define(
  [
    "sap/m/MessageToast",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel",
    "customActivity/scripts/transactionCaller",
  ],
  function (
    MessageToast,
    Controller,
    JSONModel,
    ResourceModel,
    TransactionCaller
  ) {
    "use strict";
    return Controller.extend(
      "customActivity.controller.fragments.qualityResultsFragment",
      {
 // DATA ÇEKME -MOKTAY
 setBilletData: function () {
    var response = TransactionCaller.async(
        "ItelliMES/UI/QUALITY_SCREEN/T_GET_ZQM_SONUC", {
    
        },
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
    let qualityTable = sap.ui.core.Fragment.createId(
        "idqualityresultsfragment",
        "idQualityResultTable"
      );
      qualityTable.setModel(myModel);
  // iv_scope.getView().byId("idBilletQualityResults").setModel(myModel);

    return myModel;
},


      }
    );
  }
);
