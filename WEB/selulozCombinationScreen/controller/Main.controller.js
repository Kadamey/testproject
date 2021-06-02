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
      "selulozCombinationScreen/scripts/transactionCaller",
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
      var myModel,RESOURCE,SFC;
      var startTime="";
      var endTime="";
      return Controller.extend("selulozCombinationScreen.controller.Main", {
        onInit: function () {
          //this.getAllLines();
          // this.setDummyData();
         SFC = jQuery.sap.getUriParameters().get("SFC");
          RESOURCE = jQuery.sap.getUriParameters().get("RESOURCE");
this.setDateFunction();
          
  
         
      //  this.getSecondTableOrderDatas();
          /*this.getAllMaterials();*/
       
       //this.getSelulozFeaturesScrapt();
        },
        onCollapseAll: function() {
		this.byId("idInvTable").collapseAll();
			
		},
onExpandFirstLevel: function() {
			this.byId("idInvTable").expandToLevel(1);
			
		},
onCollapseSelection: function() {
			
			this.byId("idInvTable").collapse(this.byId("idInvTable").getSelectedIndices());
		},
onExpandSelection: function() {
			
			this.byId("idInvTable").expand(this.byId("idInvTable").getSelectedIndices());
		},		

        /*getInitialDatas: function () {
          TransactionCaller.async(
            "ECZ_MES-4.0/KAGIT/selulozCombinationScreen/T_GetShopOrderFromWC",
            {
              I_WORKCENTER: RESOURCE,
            },
            "O_JSON",
            this.getInitialDatasCB,
            this,
            "GET"
          );
        },
  
        getInitialDatasCB: function (iv_data, iv_scope) {
         this.getHierarchyFunction(iv_data[0],"SHOP_ORDER", "Rowsets","Rowset","Row");
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
  
          iv_scope.getView().byId("idOrderTable").setModel(myModel);
        },*/
        
           /*onOrdersTableSelectionChange:function (oEvent) {
                                                            
                      //var sIndex = oEvent.getSource().getSelectedItem();
                      var smBinding = this.getView()
                          .byId("idOrderTable")
                          .getBindingPath("rows");
                      
                      var selectedShopOrder =  oEvent.getSource().getSelectedItem().getBindingContext(smBinding).getObject().SHOP_ORDER;
  
                      this.getSecondTableOrderDatas(selectedShopOrder);
                      this.getSelulozFeaturesScrapt(selectedShopOrder);
                  },*/
          getSecondTableOrderDatas: function () {
                      TransactionCaller.async(
                          "ECZ_MES-4.0/KAGIT/selulozCombinationScreen/T_secondTableDatas_deneme",
                          {
                              I_WORKCENTER: RESOURCE,
                              I_SFC: SFC,
                              I_STARTDATE:startTime,
                              I_ENDDATE:endTime
               
                          },
                          "O_JSON",
                          this.getSecondTableOrderDatasCB,
                          this
                      );
                  },
          
                  getSecondTableOrderDatasCB: function (iv_data, iv_scope) {
                     // iv_scope.returnFunc();
                   // var formattedData = returnFunc();
                 var formattedData= iv_scope.getHierarchyFunction(iv_data,"SHOP_ORDER", "Rowsets","Rowset","Row");
                    
                      var myModel = new sap.ui.model.json.JSONModel();
                      myModel.setData(formattedData);
                      iv_scope.getView().byId("idInvTable").setModel(myModel);
                      //if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
                        //  myModel.setData(iv_data[0]);
                      //} else if (!iv_data[0].Rowsets.Rowset.Row) {
                        //  myModel.setData(null);
                      //} else {
                        //  var obj_iv_data = iv_data[0];
                          //var dummyData = [];
                          //dummyData.push(iv_data[0].Rowsets.Rowset.Row);
                          //obj_iv_data.Rowsets.Rowset.Row = dummyData;
                          //myModel.setData(obj_iv_data);
                     // }
  
                      iv_scope.getView().byId("idInvTable").setModel(myModel);
                      iv_scope.getView().byId("idInvTable").setBusy(false);
                  },
        /*getSelulozFeatures: function () {
            TransactionCaller.async(
              "ECZ_MES-4.0/KAGIT/selulozCombinationScreen/T_GetSelulozFeaturesForLongAndShort",
              {
                 I_SFC: SFC,
  I_TYPE:"Uzun"
              },
              "O_JSON",
              this.getSelulozFeaturesCB,
              this,
              "GET"
            );
          },
    
          getSelulozFeaturesCB: function (iv_data, iv_scope) {
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
    
            iv_scope.getView().byId("idInvTable").setModel(myModel);
          },
          */ 
         /*getSelulozFeaturesScrapt: function (selectedShopOrder) {
            TransactionCaller.async(
              "ECZ_MES-4.0/KAGIT/selulozCombinationScreen/T_Get_SelulozFeaturesForScrapt_deneme",
              {
                I_SHOPORDER: selectedShopOrder,
                I_TYPE:"Dese"
              },
              "O_JSON",
              this.getSelulozFeaturesScraptCB,
              this,
              "GET"
            );
          },
    
          getSelulozFeaturesScraptCB: function (iv_data, iv_scope) {
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
    
            iv_scope.getView().byId("idScraptTable").setModel(myModel);
            iv_scope.getView().byId("idScraptTable").setBusy(false);
          },*/


          getHierarchyFunction:function(iv_data,key,prefix1,prefix2,prefix3){
              

            var newContainer = [];
            var tempData = JSON.parse(JSON.stringify(iv_data[0]));
            tempData.Rowsets.Rowset.Row.forEach((rowItem)=>{
                var found = false;
                var tempRow = JSON.parse(JSON.stringify(rowItem));
                newContainer.forEach((contItem) => {
                    if(contItem.SHOP_ORDER == tempRow.SHOP_ORDER){
                    found = true;
                    contItem.children.push(tempRow);
                    }
                    
            },this);
            
             
            
                if(!found){
                    tempRow["children"] = [rowItem];
                    newContainer.push(tempRow);
                }
            
             
            
            },this)
            
             
            
            newContainer.forEach((item) => {
            
             
            
                var childContainer = [];
                item.children.forEach((childrenItem) => {
            
             
            
                  var found = false;
                var tempRow = JSON.parse(JSON.stringify(childrenItem));
                childContainer.forEach((contItem) => {
                    if(contItem.TYPE == tempRow.TYPE){
                    found = true;
                    contItem.children.push(tempRow);
                    }    
            
             
            
            },this);
                 if(!found){
                    tempRow["children"] = [childrenItem];
                    childContainer.push(tempRow);
                }
            
             
            
            },this);
            item.children = childContainer;
            },this)
            
             
            
            
            newContainer.forEach((item) => {
                item.children.forEach((childItem)=>{
                var childContainer = [];
                childItem.children.forEach((secondChild) => {
                     var found = false;
                    var tempRow = JSON.parse(JSON.stringify(secondChild));
                    childContainer.forEach((contItem) => {
            
             
            
            
                    if(contItem.CHARGE_SEQUENCE == tempRow.CHARGE_SEQUENCE){
                    found = true;
                    contItem.children.push(tempRow);
                    }    
            
             
            
                    },this);
            
             
            
             if(!found){
                    tempRow["children"] = [secondChild];
                    childContainer.push(tempRow);
                }
            },this);
                   
            childItem.children = childContainer;
            },this);
            },this);
 
           


 newContainer.forEach((item) => {
    //Temel seviye
    item.MARKA = "";
    item.WEIGHT = "";
    item.TYPE = "";
    item.ADET = "";
    item.ROW_NUM = "";
    item.RECEIVE_DATE_TIME = "";
    item.INSDATE = "";

    item.children.forEach((cItem) => {
        // 2. seviye
    cItem.MARKA = "";
   // cItem.DESCRIPTION = "";
   // cItem.SHOP_ORDER = "";
    cItem.WEIGHT = "";
    cItem.ADET = "";
    cItem.ROW_NUM = "";
    cItem.RECEIVE_DATE_TIME = "";
    cItem.INSDATE = "";


        cItem.children.forEach((ccItem) =>{
            //3. seviye
    ccItem.MARKA = "";
   // ccItem.DESCRIPTION = "";
   // ccItem.SHOP_ORDER = "";
    ccItem.WEIGHT = "";
    ccItem.ADET = "";
    ccItem.TYPE = "";

            ccItem.children.forEach((cccItem) =>{

               // cccItem.DESCRIPTION = "";
               // cccItem.SHOP_ORDER = "";
                cccItem.TYPE = "";

            },this);
            
    },this);

    },this);

    },this)





            return newContainer;
            },

            onPressFilterButton:function () {
                

//                startTime = this.getView().byId("DTP1").getDateValue();
  //               endTime =this.getView().byId("DTP2").getDateValue();

	 startTime = this.getView().byId("DTP1").getDateValue();
            startTime = startTime.toISOString().split("T")[0] +" "+ startTime.toTimeString().substr(0, 8);

 endTime = this.getView().byId("DTP2").getDateValue();
            endTime = endTime.toISOString().split("T")[0] +" "+ endTime.toTimeString().substr(0, 8);
                 
                 if (startTime == null || endTime == null) {
                    MessageBox.error("Tarih alanları boş bırakılamaz");
                    return;
                }
             //  startTime = startTime.toISOString();
             //   endTime = endTime.toISOString();

                this.getSecondTableOrderDatas();
                // var orderNo = this.getView().byId("INP1").getValue();
                // var operNo = this.getView().byId("INP2").getValue();
                // var castNo = this.getView().byId("INP3").getValue();
                // var batchNo = this.getView().byId("INP4").getValue();
                // var materialNo = this.getView().byId("INP5").getValue();
                // var workplace = this.getView().byId("INP6").getValue();
               
            },
 setDateFunction:function () {
                var date = new Date();
                var yesterday = new Date();
                var today = new Date();
                yesterday.setDate(date.getDate() - 2);
                today.setDate(date.getDate() + 2);
                this.getView().byId("DTP1").setDateValue(yesterday);
                this.getView().byId("DTP2").setDateValue(today);
            },

        

         //returnFunc: function(){
               //this.getHierarchyFunction();
                //return newContainer;
               
            //    }
                 
               






            /*getHierarchyFunctionCB: function (iv_data, iv_scope) {
             var firstHierarchy=  this.getHierarchyFunction(iv_data[0],"SHOP_ORDER", "Rowsets","Rowset","Row");
             var secondHieararchy= this.getHierarchyFunction(firstHierarchy,"TYPE", "Rowsets","Rowset","Row");
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

                iv_scope.getView().byId("idInvTable").setModel(myModel);
                iv_scope.getView().byId("idInvTable").setBusy(false);
            },*/
          
  
        /*onPressSelulozAddButton: function(){
  
            var selectedContextPath = this.getView()
          .byId("idOrderTable")
          .getSelectedContextPaths("rows");
        var selectedLine = this.getView()
          .byId("idOrderTable")
          .getModel()
                    .getObject(selectedContextPath[0]);
                    
  
            if (!this._oDialogPacal) {
                this._oDialogPacal = sap.ui.xmlfragment(
                    "Z_SelulozAddFragment",
                    "selulozCombinationScreen.view.fragments.selulozAdd",
                    this
                );
  
           
  
                this.getView().addDependent(this._oDialogPacal);
            }
  
  
            this._oDialogPacal.open();
  this.getAllMaterials();
  
        },
        getAllMaterials: function () {
            TransactionCaller.async(
              "ECZ_MES-4.0/KAGIT/selulozCombinationScreen/T_GetMaterialsBelongsToSeluloz",
              {},
              "O_JSON",
              this.getAllMaterialsCB,
              this,
              "GET",
              {}
            );
          },
          getAllMaterialsCB: function (iv_data, iv_scope) {
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
  
                sap.ui.core.Fragment.byId("Z_SelulozAddFragment", "idMaterialCombobox").setModel(oModel);
               // iv_scope.getView().byId("idMaterialCombobox").setModel(oModel);
          },
  
         
  
          onPressAddSelulozButton: function(oEvent){
  
              var material=sap.ui.core.Fragment.byId("Z_SelulozAddFragment", "idMaterialCombobox").getSelectedKey();
              var weight = sap.ui.core.Fragment.byId("Z_SelulozAddFragment", "idMaterialCombobox").getModel().getData().Rowsets.Rowset.Row.find((o)=>o.ITEM==material).WEIGHT;
              var quantity = sap.ui.core.Fragment.byId("Z_SelulozAddFragment", "quantity").getValue();
  
              var existingTableData=[];
              
  
              sap.ui.core.Fragment.byId("Z_SelulozAddFragment", "idSelulozAddTable").getModel()?.getData().forEach((input,index)=>{existingTableData[index]=input})
  
              
              var jsonDataforInputs = [];
              jsonDataforInputs.push({
                  material: material,
                  quantity: quantity,
                  weight: weight*quantity
                  
              });
              existingTableData[existingTableData.length]=jsonDataforInputs[0];
              var oModel = new sap.ui.model.json.JSONModel();
  
              oModel.setData(existingTableData);
              sap.ui.core.Fragment.byId("Z_SelulozAddFragment", "idSelulozAddTable").setModel(oModel);
  
  
          } */
  
  
  
      });
    }
  );
  