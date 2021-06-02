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
	  "paletteScreen/scripts/transactionCaller",
	  "sap/m/Dialog",
	  "sap/m/Text",
	  "sap/m/TextArea",
	  "sap/m/Button",
	  "sap/m/DialogType",
	  "sap/m/ButtonType",
	  "sap/ui/core/BusyIndicator",
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
	  TransactionCaller,
	  Dialog,
	  Text,
	  TextArea,
	  Button,
	  DialogType,
	  ButtonType,
	  BusyIndicator
	) {
	  "use strict";
	  var that, sPath, unit, SFC, SITE, LOGON, RESOURCE, katlamaOrder;
	  var palletteQtyMasterData;
	  return Controller.extend("paletteScreen.controller.Main", {
		onInit: function () {
		  SFC = jQuery.sap.getUriParameters().get("SFC");
		  SITE = jQuery.sap.getUriParameters().get("SITE");
		  LOGON = jQuery.sap.getUriParameters().get("LOGON");
		  RESOURCE = jQuery.sap.getUriParameters().get("RESOURCE");
		  this.getAllLines(); 
		  katlamaOrder = 0;
		  if (!RESOURCE) {
			MessageToast.show("Operasyon Seçiniz.");
			return;
		  }
		  //this.setWcsOnCombobox();
		},
  
		setWcsOnCombobox: function () {
		  TransactionCaller.async(
			"ECZ_MES-4.0/KONVERTING/PALETTE_SCREEN/GET_WC_FROM_SFC/setWcsOnCombobox",
			{
			  I_RESOURCE: RESOURCE,
			  I_SITE: SITE,
			},
			"O_JSON",
			this.setWcsOnComboboxCB,
			this,
			"GET",
			{}
		  );
		},
		setWcsOnComboboxCB: function (iv_data, iv_scope) {
		  if (!!iv_data[0].Rowsets.Rowset.Row) {
  
			  if(!Array.isArray(iv_data[0].Rowsets.Rowset.Row)){
  
				  iv_data[0].Rowsets.Rowset.Row = [iv_data[0].Rowsets.Rowset.Row];
				  
			  }
  
  
			iv_scope
			  .getView()
			  .byId("idLineComboBox")
			  .setSelectedKey(iv_data[0].Rowsets.Rowset.Row[0].PARENT);
  
			  iv_scope
			  .getView()
			  .byId("idUnitComboBox")
			  .setSelectedKey(RESOURCE.substr(RESOURCE.lastIndexOf("_") + 1));
  
			  iv_scope.onSelectUnit();
		  iv_scope.getPackageDetails();
			  /*
			iv_scope
			  .getView()
			  .byId("idUnitComboBox")
			  .setSelectedKey(iv_data[0].Rowsets.Rowset.Row[0].CHILD);
			iv_scope.onSelectUnit();
			*/
		  } else {
			iv_scope
			  .getView()
			  .byId("idLineComboBox")
			  .setSelectedKey(RESOURCE.substr(RESOURCE.lastIndexOf("_") + 1));
			  iv_scope.onSelectUnit();
		  iv_scope.getPackageDetails();
		  }
		  
		  iv_scope.onSelectLine();
  
		  /*
  
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
				  myModel.refresh();
				  iv_scope
					  .getView()
					  .byId("idLineComboBox")
					  .setSelectedKey(iv_data[0].Rowsets.Rowset.Row[0].PARENT);
				  iv_scope.onSelectLine();
  
				  iv_scope
					  .getView()
					  .byId("idUnitComboBox")
					  .setSelectedKey(iv_data[0].Rowsets.Rowset.Row[0].CHILD);
				  iv_scope.onSelectUnit();
		  */
		},
  
		getPackageDetails: function () {
		  //  this.refreshStartTrigger();
		  var selectedWorkCenter = this.getView().byId("idText1").getText();
		  TransactionCaller.async(
			"ECZ_MES-4.0/KONVERTING/PALETTE_SCREEN/GET_PACKAGE_DETAILS/T_GetPackageDetailsFromSfcAndWC",
			{
			  I_SFC: SFC,
			  I_WORK_CENTER: selectedWorkCenter,
			},
			"O_JSON",
			this.getPackageDetailsCB,
			this,
			"GET",
			{}
		  );
		},
		getPackageDetailsCB: function (iv_data, iv_scope) {
		  var myModel = new sap.ui.model.json.JSONModel();
  
		  var packageNr;
  
		  if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
			myModel.setData(iv_data[0]);
			packageNr = iv_data[0].Rowsets.Rowset.Row[0].PACKAGENO;
		  } else {
			var obj_iv_data = iv_data[0];
			var dummyData = [];
			dummyData.push(iv_data[0].Rowsets.Rowset.Row);
			obj_iv_data.Rowsets.Rowset.Row = dummyData;
			myModel.setData(obj_iv_data);
			packageNr = obj_iv_data.Rowsets.Rowset.Row[0].PACKAGENO;
		  }
  
		  var splittedPCK = packageNr.substring(3);
		  var intPackage = parseInt(splittedPCK);
		  var nextPackageNr = intPackage + 1;
		  var nextPackageNrId = "PCK" + nextPackageNr;
  
		  myModel.refresh();
		  iv_scope.getView().byId("idPaletteTable").setModel(myModel);
		  iv_scope.getView().byId("idPalletNo").setValue(nextPackageNrId);
		},
  
		mesaj: function () {
		  MessageToast.show("Bilgiler Güncellendi");
		},
		// Tüm Hatları çeken fonksiyon- MOKTAY
		getAllLines: function (oEvent) {
		  TransactionCaller.async(
			"ECZ_MES-4.0/KONVERTING/PALETTE_SCREEN/GET_CONV_WC/T_GET_CONVERT_WCS",
			{
				I_SITE: SITE
			},
			"O_JSON",
			this.getAllLinesCB,
			this,
			"GET",
			{}
		  );
		},
		getAllLinesCB: function (iv_data, iv_scope) {
		  var myModel = new sap.ui.model.json.JSONModel();
  
		 // if (Array.isArray(iv_data[0])) {
			// myModel.setData(iv_data[0]);
		 // } else {
			// var obj_iv_data = iv_data[0];
			// var dummyData = [];
			// dummyData.push(iv_data[0]);
			// obj_iv_data = dummyData;
			// myModel.setData(obj_iv_data);
			// myModel.refresh();
		 // }
		 
		 	if (Array.isArray(iv_data[0].Rowsets?.Rowset?.Row)) {
				myModel.setData(iv_data[0]);
			} else if (!iv_data[0].Rowsets?.Rowset?.Row) {
				myModel.setData(null);
			} else {
				var obj_iv_data = iv_data[0];
				var dummyData = [];
				dummyData.push(iv_data[0].Rowsets.Rowset.Row);
				obj_iv_data.Rowsets.Rowset.Row = dummyData;
				myModel.setData(obj_iv_data);
			}
  
   
		  iv_scope.getView().byId("idLineComboBox").setModel(myModel);
		  iv_scope.setWcsOnCombobox();
		},
		// Tüm Üniteleri çeken fonksiyon- MOKTAY
		getAllUnits: function (oEvent) {
		  TransactionCaller.async(
			"ECZ_MES-4.0/KONVERTING/PALETTE_SCREEN/GET_CONV_WC/T_GET_CHILD_WCS",
			{
			  I_SITE: SITE,
			},
			"O_JSON",
			this.getAllUnitsCB,
			this,
			"GET"
		  );
		},
		getAllUnitsCB: function (iv_data, iv_scope) {
		  var myModel = new sap.ui.model.json.JSONModel();
  
		  var arrayCheckObj = iv_data[0].CHILD_WORKCENTER.workCenterMemberList;
		  if (Array.isArray(arrayCheckObj)) {
			myModel.setData(arrayCheckObj);
		  } else {
			var arrayHolder = new Array();
			arrayHolder.push(arrayCheckObj);
			myModel.setData(arrayHolder);
		  }
		  iv_scope.getView().byId("idUnitComboBox").setModel(myModel);
		},
  
		refreshStartTrigger: function () {
		  this.oTrigger = new sap.ui.core.IntervalTrigger(15000);
		  this.oTrigger.addListener(() => {
			this.getPackageDetails();
		  }, this);
		},
  
		//Ünite seçimi yapıldıktan sonra çalışan fonksiyon - MOKTAY
		onSelectLine: function (oEvent) {
		  var line = this.getView().byId("idLineComboBox").getSelectedKey();
		  if (!!line) {
			TransactionCaller.async(
			  "ECZ_MES-4.0/KONVERTING/PALETTE_SCREEN/GET_CONV_WC/T_GET_CHILD_WCS", // ilk comboboxtan seçim yaptıktan sonra 2. comboboxa set edilecek değrlerin çekildiği transaction
			  {
				I_LINE: line,
				I_SITE : SITE
			  },
			  "O_JSON",
			  this.onSelectLineCB,
			  this,
			  "GET"
			);
		  }
		},
  
		//2.comboboxa değerlerin set edildiği fonksiyon
		onSelectLineCB: function (iv_data, iv_scope) {
		  var myModel = new sap.ui.model.json.JSONModel();
  
		  if (iv_data[0].CHILD_WORKCENTER == null) {
			iv_scope.getView().byId("idUnitComboBox").setModel(myModel);
			iv_scope.onSelectUnit();
			return;
		  }
  
		  var arrayCheckObj = iv_data[0].CHILD_WORKCENTER.workCenterMemberList;
		  if (Array.isArray(arrayCheckObj)) {
			myModel.setData(arrayCheckObj);
		  } else {
			var arrayHolder = new Array();
			arrayHolder.push(arrayCheckObj);
			myModel.setData(arrayHolder);
		  }
  
		  iv_scope.getView().byId("idUnitComboBox").setModel(myModel);
  
		},
  
		onSelectUnit: function (oEvent) {
		  unit = this.getView().byId("idUnitComboBox").getSelectedKey();
  
		  // katlama is yerleri icin unite bilgisi olmadığı için  line bilgisi okuma eklendi bince 10032021
		  if (unit == "") {
			unit = this.getView().byId("idLineComboBox").getSelectedKey();
			katlamaOrder = 1;
		  }
		  TransactionCaller.async(
			"ECZ_MES-4.0/KONVERTING/PALETTE_SCREEN/GET_ACTIVE_SFC/T_GetActiveOrderInfoFromWC",
			{
			  I_WORK_CENTER: unit,
			  I_SITE: SITE,
			},
			"O_JSON",
			this.onSelectUnitCB,
			this,
			"GET",
			{}
		  );
		},
		onSelectUnitCB: function (iv_data, iv_scope) {
		  var myModel = new sap.ui.model.json.JSONModel();
  
		  if (iv_data[0].Results.Result1.Rowsets.Rowset.Row == undefined) {
			var dummyArr = [];
			myModel.setData(dummyArr);
  
			iv_scope.getView().byId("idText1").setText("");
			iv_scope.getView().byId("orderQuantityFieldID").setText("");
			iv_scope.getView().byId("shopOrderFieldID").setText("");
			iv_scope.getView().byId("materialCodeFieldId").setText("");
			iv_scope.getView().byId("selectedBobinId1").setText("");
			iv_scope.getView().byId("selectedBobinId2").setText("");
			iv_scope.getView().byId("idPaletteTable").setModel(myModel);
			MessageToast.show("Seçilen iş yeri için aktif siparis bulunamadi");
			return;
		  }
  
		  if (Array.isArray(iv_data[0])) {
			myModel.setData(iv_data[0]);
		  } else {
			var obj_iv_data = iv_data[0];
			var dummyData = [];
			dummyData.push(iv_data[0]);
			obj_iv_data = dummyData;
			myModel.setData(obj_iv_data);
			myModel.refresh();
		  }
  
		  /////// tek satır gelme problemi çözümü için eklendi 22042021 bince
		  if (Array.isArray(iv_data[0].Results.Result2.Rowsets.Rowset.Row)) {
		  } else {
			var obj_iv_data = iv_data[0].Results.Result2;
			var dummyData = [];
			dummyData.push(iv_data[0].Results.Result2.Rowsets.Rowset.Row);
			obj_iv_data.Rowsets.Rowset.Row = dummyData;
			iv_data[0].Results.Result2 = obj_iv_data;
		  }
  
		  /////////////////////////////////
  
		  var shopOrder =
			iv_data[0].Results.Result1.Rowsets.Rowset.Row.SHOP_ORDER;
		  var sfcNO = iv_data[0].Results.Result1.Rowsets.Rowset.Row.SFC;
		  var materialDescription =
			iv_data[0].Results.Result1.Rowsets.Rowset.Row.DESCRIPTION;
		  var remainingQuantity =
			iv_data[0].Results.Result1.Rowsets.Rowset.Row.REMAINING;
		  var completedQuantity =
			iv_data[0].Results.Result1.Rowsets.Rowset.Row.QTY_COMPLETED;
		  var targetQuantity =
			iv_data[0].Results.Result1.Rowsets.Rowset.Row.TARGET;
		  var materialNo = iv_data[0].Results.Result1.Rowsets.Rowset.Row.ITEM;
		  var workCenter =
			iv_data[0].Results.Result1.Rowsets.Rowset.Row.WORK_CENTER;
		  SFC = iv_data[0].Results.Result1.Rowsets.Rowset.Row.SFC;
  
		  if (
			iv_data[0].Results?.Result2?.Rowsets?.Rowset?.Row != undefined &&
			katlamaOrder == 0
		  ) {
			var selectedBobinId1 =
			  iv_data[0].Results.Result2.Rowsets.Rowset?.Row[0]?.INVENTORY_ID;
			var selectedBobinIdDescription1 =
			  iv_data[0].Results.Result2.Rowsets.Rowset?.Row[0]?.DESCRIPTION;
			var selectedBobinId2 =
			  iv_data[0].Results.Result2.Rowsets.Rowset?.Row[1]?.INVENTORY_ID;
			var selectedBobinIdDescription2 =
			  iv_data[0].Results.Result2.Rowsets.Rowset?.Row[1]?.DESCRIPTION;
		  } else if (
			iv_data[0].Results?.Result2?.Rowsets?.Rowset?.Row != undefined &&
			katlamaOrder == 1
		  ) {
			var selectedBobinId1 =
			  iv_data[0].Results.Result2.Rowsets.Rowset?.Row[0]?.INVENTORY_ID;
			var selectedBobinIdDescription1 =
			  iv_data[0].Results.Result2.Rowsets.Rowset?.Row[0]?.DESCRIPTION;
			var selectedBobinId2 =
			  iv_data[0].Results.Result2.Rowsets.Rowset?.Row[1]?.INVENTORY_ID;
			var selectedBobinIdDescription2 =
			  iv_data[0].Results.Result2.Rowsets.Rowset?.Row[1]?.DESCRIPTION;
			//var selectedBobinId2=""
			//var selectedBobinIdDescription2 ="";
		  }
		//  palletteQtyMasterData = iv_data[0].Results.Result1.Rowsets.Rowset.Row.PACKAGEQTY;
          palletteQtyMasterData = iv_data[0].Results.Result3.PACKAGEQTY;
		  iv_scope
			.getView()
			.byId("palletteQuantityFieldId")
			.setValue(palletteQtyMasterData);

           var palletteImageContent = "data:image/png;base64," + iv_data[0].Results.Result3.IMAGECONTENT; 
           iv_scope.getView().byId("palletteImageId").setSrc(palletteImageContent);
           iv_scope.getView().byId("palletteImageDetailId").setImageSrc(palletteImageContent);

           

		  iv_scope.getView().byId("idText1").setText(workCenter);
		  iv_scope
			.getView()
			.byId("orderQuantityFieldID")
			.setText(
			  targetQuantity +
				" / " +
				completedQuantity +
				" / " +
				remainingQuantity
			);
		  iv_scope.getView().byId("shopOrderFieldID").setText(shopOrder);
		  iv_scope
			.getView()
			.byId("materialCodeFieldId")
			.setText(materialNo + " / " + materialDescription);
		  iv_scope
			.getView()
			.byId("selectedBobinId1")
			.setText(selectedBobinId1 + " / " + selectedBobinIdDescription1);
		  iv_scope
			.getView()
			.byId("selectedBobinId2")
			.setText(selectedBobinId2 + " / " + selectedBobinIdDescription2);
  
		  //iv_scope.getView().byId("idUnitComboBox").setModel(myModel);
		  iv_scope.getPackageDetails();
		},
		// Edit fragment fonksiyonu-MOKTAY
		getDialog1: function () {
		  if (!this._oDialog) {
			this._oDialog = sap.ui.xmlfragment(
			  "palletTable_Edit",
			  "ItelliMES.view.fragments.palletTable_Edit",
			  this
			);
			this.getView().addDependent(this._oDialog);
		  }
		  return this._oDialog;
		},
		setPaletteData: function () {
		  var response = TransactionCaller.async(
			"xxxxxxxxxxxxxx",
			{},
			"O_JSON",
			this.setPaletteDataCB,
			this,
			"GET"
		  );
		},
		setPaletteDataCB: function (iv_data, iv_scope) {
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
  
		  //iv_scope.getView().byId("idPaletteTable").setModel(myModel);
		  return myModel;
		},
		//Edit butonuna basılınca çalışan fonksiyon- MOKTAY
		onClickEdit: function (oEvent) {
		  this.getDialog1().open();
		},
  
		onFragmentEditCancel: function (oEvent) {
		  this.getDialog1().close();
		},
  
		//Rakamarı inputa yazan fonksiyon-MOKTAY
		onPressNumbers: function (oEvent) {
		  oEvent.getSource().getText();
		  this.getView()
			.byId("palletteQuantityFieldId")
			.setValue(
			  this.getView().byId("palletteQuantityFieldId").getValue() +
				oEvent.getSource().getText()
			);
		},
		//Inputu tamamen silen fonksiyon-MOKTAY
		onPressClear: function (oEvent) {
		  if (oEvent.getSource().getText() == "C") {
			this.getView().byId("palletteQuantityFieldId").setValue("");
		  }
		},
  
		//Input içinde tekli Silme işlemi yapan fonksiyon-MOKTAY
		onPressBack: function () {
		  var arrayexit = this.getView().byId(
			"palletteQuantityFieldId"
		  )._lastValue;
  
		  for (var i = 0; i < arrayexit.length; i++) {
			var output = arrayexit.slice(0, -1);
			this.getView().byId("palletteQuantityFieldId").setValue(output);
		  }
		},
  
		//101 teyidi
		onPressPrintPaletteButton: function () {
		  if (this.getView().byId("shopOrderFieldID").getText() == "") {
			MessageBox.error(
			  "Ekranda aktif siparis mevcut olmadığı için etiket basilamaz"
			);
			return;
		  }
  
		  if (this.getView().byId("palletteQuantityFieldId").getValue() == "") {
			MessageBox.error("Koli adedi miktarı boş bırakılamaz");
			return;
		  }
		  if (
			Number(this.getView().byId("palletteQuantityFieldId").getValue()) <= 0
		  ) {
			MessageBox.error("Girilen değer 0'ın altında veya 0'a eşit olamaz.");
			return;
		  }
  
		  var selectedWorkCenter = this.getView().byId("idText1").getText();
		  var palletteQuantityFieldId = this.getView()
			.byId("palletteQuantityFieldId")
			.getValue();
  
            var checkNumbers = /^[0-9]+$/;
             if( palletteQuantityFieldId.match(checkNumbers)==undefined){

                MessageBox.show("Lütfen sayısal değer giriniz!");
                this.getView()
			.byId("palletteQuantityFieldId")
			.setValue("");
                return;

             }
		  // paket anaverisine göre revize edilecek şimdilik hardcode konuldu
		  if (
			palletteQuantityFieldId != palletteQtyMasterData &&
			palletteQuantityFieldId !=
			  this.getView().byId("idPaletteTable").getModel()?.getData()?.Rowsets
				?.Rowset?.Row[0]?.QTY
		  ) {
			if (!this.oApproveDialog) {
			  this.oApproveDialog = new Dialog({
				type: DialogType.Message,
				title: "Confirm",
				content: new Text({
				  text: "Paket adetini degistirdiniz, emin misiniz?",
				}),
				beginButton: new Button({
				  type: ButtonType.Emphasized,
				  text: "Submit",
				  press: function () {
					selectedWorkCenter = this.getView().byId("idText1").getText();
					palletteQuantityFieldId = this.getView()
					  .byId("palletteQuantityFieldId")
					  .getValue();
					this.showBusyIndicator(5000, 0);
					TransactionCaller.async(
					  "ECZ_MES-4.0/KONVERTING/yieldConfirmation/101confirmation/T_MainTransactionKonvConfirmation101",
					  {
						I_AUTHORIZATION_CHECK: "X",
						I_WORK_CENTER: selectedWorkCenter,
						I_SFC: SFC,
						I_QUANTITY: palletteQuantityFieldId,
						I_KATLAMA_CHECK: katlamaOrder,
					  },
					  "O_JSON",
					  this.onPressPrintPaletteButtonCB,
					  this,
					  "GET",
					  {}
					);
					//  MessageToast.show("Submit pressed!");
					this.oApproveDialog.close();
					return;
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
			//else if (palletteQuantityFieldId == palletteQtyMasterData)
		  } else {
			this.showBusyIndicator(5000, 0);
			TransactionCaller.async(
			  "ECZ_MES-4.0/KONVERTING/yieldConfirmation/101confirmation/T_MainTransactionKonvConfirmation101",
			  {
				I_AUTHORIZATION_CHECK: "",
				I_WORK_CENTER: selectedWorkCenter,
				I_SFC: SFC,
				I_QUANTITY: palletteQuantityFieldId,
				I_KATLAMA_CHECK: katlamaOrder,
			  },
			  "O_JSON",
			  this.onPressPrintPaletteButtonCB,
			  this,
			  "GET",
			  {}
			);
		  }
		},
  
		onPressPrintPaletteButtonCB: function (iv_data, iv_scope) {
		  var myModel = new sap.ui.model.json.JSONModel();
  
		  if (Array.isArray(iv_data[0])) {
			myModel.setData(iv_data[0]);
		  } else {
			var obj_iv_data = iv_data[0];
			var dummyData = [];
			dummyData.push(iv_data[0]);
			obj_iv_data = dummyData;
			myModel.setData(obj_iv_data);
			myModel.refresh();
		  }
		  MessageBox.show(iv_data[0]);
		  iv_scope.onSelectUnit();
		  iv_scope.getPackageDetails();
		},
  
		showBusyIndicator: function (iDuration, iDelay) {
		  BusyIndicator.show(iDelay);
  
		  if (iDuration && iDuration > 0) {
			if (this._sTimeoutId) {
			  clearTimeout(this._sTimeoutId);
			  this._sTimeoutId = null;
			}
  
			this._sTimeoutId = setTimeout(
			  function () {
				this.hideBusyIndicator();
			  }.bind(this),
			  iDuration
			);
		  }
		},
  
		hideBusyIndicator: function () {
		  BusyIndicator.hide();
		  this.getPackageDetails();
		},
  
		onClickDelete: function (oEvent) {
		  var selectedPathRaw = oEvent.getSource().getBindingContext().getPath(); //dummy/row/2
		  var selectedIndex = selectedPathRaw.substr(
			selectedPathRaw.lastIndexOf("/") + 1,
			selectedPathRaw.lenght
		  );
		  this.meConfCount = oEvent.getSource().getParent().getModel().getData()
		  .Rowsets.Rowset.Row[selectedIndex].ME_CONF_COUNT;
  
		  if (!this.oApproveDialog2) {
			this.oApproveDialog2 = new Dialog({
			  type: DialogType.Message,
			  title: "Confirm",
			  content: new Text({
				text: "Palet silme işlemi yapmak istediğinize emin misiniz?",
			  }),
			  beginButton: new Button({
				type: ButtonType.Emphasized,
				text: "Submit",
				press: function () {
				  this.showBusyIndicator(10000, 0);
		
				  TransactionCaller.async(
					"ECZ_MES-4.0/COMMON/CONF_CANCEL/cancelSapConfirmation/T_MainTransactionConfirmationCancelSAP",
					{
					  I_ME_CONF_COUNT: this.meConfCount,
					},
					"O_JSON",
					this.onClickDeleteCB,
					this,
					"GET",
					{}
				  );
				  //  MessageToast.show("Submit pressed!");
				  this.oApproveDialog2.close();
				  return;
				}.bind(this),
			  }),
			  endButton: new Button({
				text: "Cancel",
				press: function () {
				  this.oApproveDialog2.close();
				}.bind(this),
			  }),
			});
		  }
  
		  this.oApproveDialog2.open();
		},
		onClickDeleteCB: function (iv_data, iv_scope) {
		  MessageBox.show(iv_data[0]);
		  // iv_scope.confirmSeconds = 3;
		  // iv_scope.cTrigger = new sap.ui.core.IntervalTrigger(1000);
		  // iv_scope.cTrigger.addListener(() => {
		  // 	iv_scope.confirmSeconds = iv_scope.confirmSeconds - 1;
		  // 	if (iv_scope.confirmSeconds == 0) {
		  // 		iv_scope.cTrigger.destroy();
		  //         iv_scope.onSelectLine();
		  // 	}
		  // }, this);
		  iv_scope.onSelectUnit();
		  iv_scope.getPackageDetails();
		},
		ResourceBundle: function (iv_id) {
		  var oBundle = this.getView().getModel("i18n").getResourceBundle();
		  var txt = oBundle.getText(iv_id);
		  return txt;
		},
	  });
	}
  );
  