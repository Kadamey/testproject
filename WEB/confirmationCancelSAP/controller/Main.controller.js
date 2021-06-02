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
      "confirmationCancelSAP/scripts/transactionCaller",
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
      var that, sPath, myModel, tableModel, SFC;
      let frgData;
      var oRouter;
      var selectedWorkCenter;
      return Controller.extend("confirmationCancelSAP.controller.Main", {
          onInit: function () {
        
            
              this.getAllWCS();
          },
       
       

          getInitialDatas: function (selectedWorkCenter) {

              TransactionCaller.async(
                  "ECZ_MES-4.0/COMMON/CONF_CANCEL/T_GetConfHeaderInfo",
                  {
                      I_WORK_CENTER:selectedWorkCenter
                  },
                  "O_JSON",
                  this.getInitialDatasCB,
                  this,
                  "GET"
              );

          },

          getInitialDatasCB: function (iv_data, iv_scope) {

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

              iv_scope.getView().byId("idOrderHeaderTable").setModel(myModel);


          },

          onPressOrderHeaderTable: function (oEvent) {

              var selectedModel = oEvent
                  .getSource()
                  .getModel()
                  .getProperty(oEvent.getSource().getSelectedContextPaths()[0]);

              TransactionCaller.async(
                  "ECZ_MES-4.0/COMMON/CONF_CANCEL/T_GetTimeTicketandGoodsMvtInfo",
                  {

                      I_ME_CONF_COUNT: selectedModel.ME_CONF_COUNT

                  },
                  "O_JSON",
                  this.onPressOrderHeaderTableCB,
                  this,
                  "GET"
              );

          },

          onPressOrderHeaderTableCB: function (iv_data, iv_scope) {

              var myModel = new sap.ui.model.json.JSONModel();
              
              var myModel2 = new sap.ui.model.json.JSONModel();
                          
              
              myModel.setData(iv_data[0].Result);
              iv_scope.getView().byId("idGoodsMovementTable").setModel(myModel);
              


              
          //time tickets icin yapıldı, gerekirse goods movement içinde eklenecek
              if(Array.isArray(iv_data[0].Result.Timetickets.Rowsets.Rowset.Row)==false){
                  
                  myModel2.setData(Array(iv_data[0].Result.Timetickets.Rowsets.Rowset.Row));
              }else{

                  myModel2.setData(iv_data[0].Result.Timetickets.Rowsets.Rowset.Row);
              }

         

              iv_scope.getView().byId("idOrderTimeTicketsTable").setModel(myModel2);


          },

          getAllWCS: function getAllWCS() {
              TransactionCaller.async(
                "ECZ_MES-4.0/KAGIT/SHOP_ORDER_RELEASE/GET_ALL_WC/T_SlcAllWCList",
                {},
                "O_JSON",
                this.getAllWCSCB,
                this,
                "GET"
              );
            },
    
            getAllWCSCB: function getAllWCSCB(iv_data, iv_scope) {
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
    
              iv_scope.getView().byId("workCenterComboBox").setModel(myModel);
            },
            onWorkCenterComboBoxChange: function () {
              selectedWorkCenter = this.getView()
               .byId("workCenterComboBox")
               .getValue();


              // time ticket ve goods movement tablosunun icndeki dataları combo box secilince bosaltmak icin eklendi
               var dummyModel = new sap.ui.model.json.JSONModel();
               var dummyData =[];
               dummyModel.setData(dummyData);
               this.getView().byId("idOrderTimeTicketsTable").setModel(dummyModel);                 
               this.getView().byId("idGoodsMovementTable").setModel(dummyModel);

             this.getInitialDatas(selectedWorkCenter);
           },
           onPressConfEditButton:function(oEvent){
             

              this.getView().byId("idGoodsMovementTable").getModel().getData().GoodsMovements.Rowsets.Rowset.Row.forEach((input,index)=>{
                  
                input.EDITABLE= true;
              
              });
             
              this.getView().byId("confEditButton").setVisible(false);
              this.getView().byId("confEditCancelButton").setVisible(true);
              this.getView().byId("confSaveButton").setVisible(true); 
            
              this.getView().byId("idGoodsMovementTable").getModel().refresh();
           },
          
           // duzenleme iptal fonksiyonu
           onPressConfEditCancelButton:function(oEvent){
              this.getView().byId("idGoodsMovementTable").getModel().getData().GoodsMovements.Rowsets.Rowset.Row.forEach((input,index)=>{
                  
                  input.EDITABLE= false;
                
                });
              
                this.getView().byId("confEditButton").setVisible(true);
                this.getView().byId("confEditCancelButton").setVisible(false);
                this.getView().byId("confSaveButton").setVisible(false); 
                this.getView().byId("idGoodsMovementTable").getModel().refresh();

           },
        
           //düzenlenen teyit sakla fonksiyonu
           onPressConfEditSaveButton:function(oEvent){

              // teyit gönderme fonksiyonu eklenecek!!!!!!!!!
              var sIndex =  this.getView().byId("idOrderHeaderTable").getSelectedContextPaths()[0]
              var selectedLine = this.getView().byId("idOrderHeaderTable").getModel().getObject(sIndex);
              var headerData = JSON.stringify(selectedLine);

              var goodsMvtData = JSON.stringify( this.getView().byId("idGoodsMovementTable").getModel().getData().GoodsMovements.Rowsets.Rowset.Row);
              var timeTicketsData = JSON.stringify( this.getView().byId("idOrderTimeTicketsTable").getModel().getData());

              //önceki teyidi iptal edip yeni teyidi verecek transaction
              TransactionCaller.async(
                  "ECZ_MES-4.0/COMMON/CONF_CANCEL/updateSapConfirmation/T_MainTransactionConfirmationUpdateSAP",
                  {I_GOODS_MVT_DATA:goodsMvtData,
                      I_HEADER_DATA:headerData,
                      I_TIME_TICKET_DATA:timeTicketsData
                  
                  },
                  "O_JSON",
                  this.onPressConfEditSaveButtonCB,
                  this,
                  "GET"
                );


              this.getView().byId("idGoodsMovementTable").getModel().getData().GoodsMovements.Rowsets.Rowset.Row.forEach((input,index)=>{
                  
                  input.EDITABLE= false;
                
                });
              
                this.getView().byId("confEditButton").setVisible(true);
                this.getView().byId("confEditCancelButton").setVisible(false);
                this.getView().byId("confSaveButton").setVisible(false); 
                this.getView().byId("idGoodsMovementTable").getModel().refresh();


           },

           onPressConfEditSaveButtonCB : function(iv_data, iv_scope){
              
              MessageToast.show(iv_data[0]);
              iv_scope.getInitialDatas();


           },
           onPressConfDeleteButton:function(oEvent){
              //teyit iptal fonksiyonu eklenecek
             var sIndex =  this.getView().byId("idOrderHeaderTable").getSelectedContextPaths()[0]
             var selectedLine = this.getView().byId("idOrderHeaderTable").getModel().getObject(sIndex);

              TransactionCaller.async(
                  "ECZ_MES-4.0/COMMON/CONF_CANCEL/cancelSapConfirmation/T_MainTransactionConfirmationCancelSAP",
                  {I_ME_CONF_COUNT:selectedLine.ME_CONF_COUNT},
                  "O_JSON",
                  this.onPressConfDeleteButtonCB,
                  this,
                  "GET"
                );

           },
           onPressConfDeleteButtonCB : function(iv_data, iv_scope){
              
              MessageToast.show(iv_data[0]);
              iv_scope.getInitialDatas();


           }

      });
  }
);
