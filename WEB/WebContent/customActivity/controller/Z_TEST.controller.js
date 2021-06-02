sap.ui.define(
    [
        "sap/m/MessageToast",
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/resource/ResourceModel",
        "customActivity/scripts/transactionCaller"
    ],
    function (
        MessageToast,
        Controller,
        JSONModel,
        ResourceModel,
        TransactionCaller
    ) {
        "use strict";
        var that;
        return Controller.extend("customActivity.controller.Z_SINTER_SCREEN", {
            onInit: function (oEvent) {

                that = this;
                this.appComponent = this.getView().getViewData().appComponent;
                this.appData = this.appComponent.getAppGlobalData();

                this.appComponent.getRouter().attachRouteMatched(this.onRouteMatched, this);
              this.bindCardsGrid();
     
               this.appComponent.getEventBus().subscribe(this.appComponent.getId(), "shiftChange", this.handleShiftChange, this);
            },


bindCardsGrid: function() {
   var response= this.getCastStocksInOven();

   var rowData =[];

   response[0].Rowsets.Rowset.Row.forEach((index,input)=>{rowData.push(index)});

   //tek satır veri gelmesi icin aktif edilecek
//    if (Array.isArray(response[0].Rowsets.Rowset.Row)) {
//     response[0].Rowsets.Rowset.Row.forEach((index,input)=>{rowData.push(index)});
// } else {
//     rowData= response[0];
//     var dummyData = [];
//     dummyData.push(response[0].Rowsets.Rowset.Row);
//     rowData= dummyData;
   
// }  

   

  var oModel = new sap.ui.model.json.JSONModel();
  oModel.setData({ "cards": rowData });
  this.getView().setModel(oModel);
},

getCastStocksInOven: function(){
    var response = TransactionCaller.sync(
        "ItelliMES/OPERATIONS/STOCK_TRACKING/T_SLC_COUNT_FIRIN_QUANTITY",
        { },
        "O_JSON"
    );


    
    return response;

}
          

            
        });
    }
);








