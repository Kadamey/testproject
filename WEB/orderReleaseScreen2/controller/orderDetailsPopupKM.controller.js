 /* global sap,$,_ */
 sap.ui.define(
    [
      'sap/ui/core/mvc/Controller',
      'sap/ui/model/json/JSONModel',
      'sap/m/MessageToast',
      'sap/m/MessageBox',
      'orderReleaseScreen/scripts/transactionCaller'
    ],
    function (
      Controller,
      JSONModel,
      MessageToast,
      MessageBox,
      TransactionCaller
    ) {
      'use strict'
      /* jshint -W061 */
      return Controller.extend(
        'orderReleaseScreen.controller.orderDetailsPopupKM',
        (function () {
          var controller
          var previous
  
          return {
            onInit: onInit,
            onPressFilterButton:onPressFilterButton,
            getOrderList:getOrderList,
            getOrderListCB:getOrderListCB,
            getAllWCS:getAllWCS,
            getAllWCSCB:getAllWCSCB,
            onOrdersTableSelectionChange:onOrdersTableSelectionChange,
            getSecondTableOrderDatas:getSecondTableOrderDatas,
            getSecondTableOrderDatasCB:getSecondTableOrderDatasCB,
            onPressReleaseButton:onPressReleaseButton,
            setDateFunction:setDateFunction,
            onPressOrderDetailButton:onPressOrderDetailButton,
            getDialog1:getDialog1,
            onFragmentCancel:onFragmentCancel,
            onNavBack:onNavBack,
            _fnAttachment:_fnAttachment,
            _fnRouteMatched,_fnRouteMatched

  
            
          }
  
          var that = this
  
          function onInit () {
             //   this.router = sap.ui.core.UIComponent.getRouterFor(this);
              //  this.router.attachRouteMatched(this._fnRouteMatched,this);
               // this.onNavBack();


           // this.setDateFunction();
           //  this.getAllWCS();
  
    
          }
          function _fnRouteMatched(oEvent){
            var sRouteName = oEvent.getParamter("name");
            if(sRouteName==="orderDetailsPopupKM"){
                  var args = oEvent.getParameter("arguments");
                  this._fnAttachment(args);  
            };

          }

          function _fnAttachment(args){

            if(!args){
                this.onNavBack();

            } else{

                that=this;   
            }
            

          }

          function onNavBack(){
              this.router.navTo("Main");
          }
        
        function setDateFunction(){
  
            var date = new Date();
            var yesterday = new Date();
            var today = new Date()
            yesterday.setDate(date.getDate()-2);
            today.setDate(date.getDate()+2);
            this.getView().byId("DTP1").setDateValue(yesterday);
            this.getView().byId("DTP2").setDateValue(today);
  
  
        }
  
        function onPressFilterButton(){
  
   
  
      var selectedWorkCenter= this.getView().byId("workCenterComboBox").getValue();
  
      var startTime = this.getView().byId("DTP1").getDateValue();
      var endTime = this.getView().byId("DTP2").getDateValue();
      alert(selectedWorkCenter);
       
          
      if (startTime == null || endTime == null) {
        MessageBox.error("Tarih alanları boş bırakılamaz");
        return;
      }
      startTime = startTime.toISOString();
      endTime = endTime.toISOString();
      // var orderNo = this.getView().byId("INP1").getValue();
      // var operNo = this.getView().byId("INP2").getValue();
      // var castNo = this.getView().byId("INP3").getValue();
      // var batchNo = this.getView().byId("INP4").getValue();
      // var materialNo = this.getView().byId("INP5").getValue();
      // var workplace = this.getView().byId("INP6").getValue();
      this.getOrderList(selectedWorkCenter,startTime,endTime)
    
        }
        function getAllWCS() {
          TransactionCaller.async(
              "ECZ_MES-4.0/KAGIT/SHOP_ORDER_RELEASE/GET_ALL_WC/T_SlcAllWCList", {},
              "O_JSON",
              this.getAllWCSCB,
              this,
              "GET"
          );
  
      }
  
      function getAllWCSCB(iv_data, iv_scope) {
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
       
      }
  
        function getOrderList(selectedWorkCenter,startTime,endTime){
      
    TransactionCaller.async("ECZ_MES-4.0/KAGIT/SHOP_ORDER_RELEASE/T_GetShopOrderListFromWC", {
      I_WORKCENTER:selectedWorkCenter,
      I_STARTDATE:startTime,
      I_ENDDATE:endTime
      },
      "O_JSON",
      this.getOrderListCB,
      this);
  }
  function getOrderListCB(iv_data,iv_scope) {
  
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
  
    iv_scope.getView().byId("orderReleasedTable1").setModel(myModel);
    iv_scope.getView().byId("orderReleasedTable1").setBusy(false);
   
    MessageToast.show("Tablo güncellendi");
  }
  
  function getSecondTableOrderDatas(selectedShopOrder){
    
    TransactionCaller.async("ECZ_MES-4.0/KAGIT/SHOP_ORDER_RELEASE/FIND_PAIRED_ORDERS/T_FindPairedOrders", {
        I_AUFNR:selectedShopOrder
        },
        "O_JSON",
        this.getSecondTableOrderDatasCB,
        this);
  
  }
  function getSecondTableOrderDatasCB(iv_data,iv_scope){
  
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
  
    iv_scope.getView().byId("orderReleasedTable2").setModel(myModel);
    iv_scope.getView().byId("orderReleasedTable2").setBusy(false);
  
  }
  
  function onPressReleaseButton(){
    debugger;
  
  
    var sIndex=this.getView().byId("orderReleasedTable1").getSelectedIndex();
    var smBinding= this.getView().byId("orderReleasedTable1").getBindingPath("rows")
    var tableData= this.getView().byId("orderReleasedTable1").getModel()?.getObject(smBinding);
    var selectedShopOrder=this.getView().byId("orderReleasedTable1").getModel()?.getObject(smBinding)[sIndex].SHOP_ORDER;
  
  var response = TransactionCaller.sync("ECZ_MES-4.0/KAGIT/SHOP_ORDER_RELEASE/RELEASE_SHOP_ORDER/T_ReleaseShopOrder", {
    I_SHOP_ORDER: selectedShopOrder
  },
    "O_JSON"
  );
  
  alert(response[0]);
  
  }
  function onOrdersTableSelectionChange(oEvent){
    var sIndex= oEvent.getSource().getSelectedIndex()
    var smBinding= this.getView().byId("orderReleasedTable1").getBindingPath("rows")
    var tableData= this.getView().byId("orderReleasedTable1").getModel()?.getObject(smBinding);
    var selectedShopOrder=this.getView().byId("orderReleasedTable1").getModel()?.getObject(smBinding)[sIndex].SHOP_ORDER;
  
    this.getSecondTableOrderDatas(selectedShopOrder);
  
  
  }
  
  function onPressOrderDetailButton(){
    
    
  var selectedWorkCenter= this.getView().byId("workCenterComboBox").getValue();
  
      var startTime = this.getView().byId("DTP1").getDateValue();
      var endTime = this.getView().byId("DTP2").getDateValue();
      alert(selectedWorkCenter);
       
  }
  
  function getDialog1 () {
    if (!this._oDialog) {
      this._oDialog = sap.ui.xmlfragment(
        "orderDetails",
        "orderReleaseScreen.view.fragments.orderDetailsPopUp",
        this
  
      );
      this.getView().addDependent(this._oDialog);
    }
    return this._oDialog;
  }
  
     function onPressOrderDetailButton(oEvent) {
        // var oContext = oEvent.getSource().getBindingContext();
        // var oObject = oContext.getObject();
  
        // var myModel = new JSONModel();
        // var data = {
        // 	oldValue: this.ivalue,
        // 	MATCODE: oObject.MATCODE,
        // };
        // myModel.setData(data);
        // this.getView("palletTable_Edit", "fragmentOnEdit").setModel(myModel);
  
        this.getDialog1().open();
        // this.getDialog1().addEventDelegate(
        // 	{ onsapenter: this.onInputEditSave },
        // 	this
        // );
        // sap.ui.core.Fragment.byId("palletTable_Edit", "value1").setValue("");
      }
  function onFragmentCancel () {
                  this.getDialog1().close();
              }
  
        })()
      )
    }
  )
  
  
  
  