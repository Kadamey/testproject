sap.ui.controller(
				"customActivity.controller.manageOrders",  
				{ 
					selectedOrder : {
						orderNumber : "",
						status : "",
						routingOperNo : "",
						productionActivity : "",
						releasedHeaderID : "",
						releasedID : "",
						baseUOM : "",
						quantityReleased : "",
						quantityReleasedUOM : "",
						material : "",
						startDate : "",
						startTime : "",
						activity : "",
						runID : "",
						numberOfCapacities : ""
					}, 
					
					onInit : function() {
						this.appComponent = this.getView().getViewData().appComponent; 
						this.appData = this.appComponent.getAppGlobalData();
						this.interfaces = this.appComponent.getODataInterface();
						
						this.appComponent.getEventBus().subscribe(this.appComponent.getId(), "shiftChanged", this.refreshOrderData, this);
						
						if(this.appData.statusList == undefined){
							this.appData.statusList = this.interfaces.interfacesGetAllStatus(this.appData.client,this.appData.plant);
							this.statusList = this.appData.statusList;
						}
						else{
							this.statusList = this.appData.statusList;
						}
						if(this.appData.productionActivities == undefined){
							this.appData.productionActivities = this.readProductionActivities();
							this.prodActivityList = this.appData.productionActivities;
						}
						else {
							this.prodActivityList = this.appData.productionActivities;
						}
						 
					    if(this.appData.defaultUom == undefined){
							this.appData.defaultUom = this.interfaces.getCustomizationValueForNode(this.appData.client, 
									this.appData.plant,
									this.appData.node.nodeID, sap.oee.ui.oeeConstants.customizationNames.defaultuomforproductionreporting);  
					    }
						this.orderOperationJSONModel = new sap.ui.model.json.JSONModel();
						this.statusJSONModel = new sap.ui.model.json.JSONModel();
						this.statusJSONModel.setData({statusDetails : sap.oee.ui.oeeConstants.status});
						this.byId("statusBar").setModel(this.statusJSONModel);
						this.operationJSONModel = new sap.ui.model.json.JSONModel();
						this.oProductionActivityModel = new sap.ui.model.json.JSONModel();
						this.oEnterTimeModel = new sap.ui.model.json.JSONModel();
						this.oSortModel = new sap.ui.model.json.JSONModel();
						this.oSelectCapacityModel = new sap.ui.model.json.JSONModel();
						this.setDefaultFilters();
						this.bindOrdersToTable();
					},
					
					setDefaultFilters : function(){
						var checkBoxIdNewStatus = this.byId("idNewStatus");
						var checkBoxIdActiveStatus = this.byId("idActiveStatus");  
						var checkBoxIdHoldStatus = this.byId("idHoldStatus");
						var checkBoxIdCompletedStatus = this.byId("idCompletedStatus");
						var checkBoxIdAbortedStatus = this.byId("idAbortedStatus");
						var shiftDependentOrders = this.byId("idShiftCheckbox");
						var activityOptionValuesForDefaultFilters;
						if(this.appData.filtersForManageOrder.selectedFilterForManageOrders.length > 0){
							activityOptionValuesForDefaultFilters = [];
							for(var i=0;i<this.appData.filtersForManageOrder.selectedFilterForManageOrders.length;i++){
								activityOptionValuesForDefaultFilters.push({optionValue:this.appData.filtersForManageOrder.selectedFilterForManageOrders[i]});
							}
						}else{
							activityOptionValuesForDefaultFilters = this.getActivityOptionValues(sap.oee.ui.oeeConstants.activityOptionNameDefaultFilters);
						}
						
						if(this.appData.filtersForManageOrder.orderBasedOnCurrentShift === true){
							activityOptionValuesForDefaultFilters.push({optionValue:sap.oee.ui.oeeConstants.status.SHIFT});
						}
						
						if(activityOptionValuesForDefaultFilters && activityOptionValuesForDefaultFilters.length>0){
							for(var i=0;i<activityOptionValuesForDefaultFilters.length;i++){
								if(activityOptionValuesForDefaultFilters[i].optionValue==sap.oee.ui.oeeConstants.status.NEW){
									checkBoxIdNewStatus.setSelected(true);
								}
								if(activityOptionValuesForDefaultFilters[i].optionValue==sap.oee.ui.oeeConstants.status.ACTIVE){
									checkBoxIdActiveStatus.setSelected(true);
								}
								if(activityOptionValuesForDefaultFilters[i].optionValue==sap.oee.ui.oeeConstants.status.HOLD){
									checkBoxIdHoldStatus.setSelected(true);
								}
								if(activityOptionValuesForDefaultFilters[i].optionValue==sap.oee.ui.oeeConstants.status.COMPLETED){
									checkBoxIdCompletedStatus.setSelected(true);
								}
								if(activityOptionValuesForDefaultFilters[i].optionValue==sap.oee.ui.oeeConstants.status.ABORTED){
									checkBoxIdAbortedStatus.setSelected(true);
								}
								if(activityOptionValuesForDefaultFilters[i].optionValue==sap.oee.ui.oeeConstants.status.SHIFT){
									shiftDependentOrders.setSelected(true);
									this.appData.filtersForManageOrder.orderBasedOnCurrentShift = true;
									
								}
							}
						}else{
							checkBoxIdActiveStatus.setSelected(true);
						}
						
					},
					
					getActivityOptionValues : function(obj){
						if(this.getView().getViewData().viewOptions && this.getView().getViewData().viewOptions.length>0){
							for(var i=0; i<this.getView().getViewData().viewOptions.length; i++){
								if(this.getView().getViewData().viewOptions[i].activityOptionValueDTOList && this.getView().getViewData().viewOptions[i].activityOptionValueDTOList.results && this.getView().getViewData().viewOptions[i].activityOptionValueDTOList.results.length>0){
									if(this.getView().getViewData().viewOptions[i].optionName == obj){
										return this.getView().getViewData().viewOptions[i].activityOptionValueDTOList.results;
										
									}
									 
								}
							}
						}
					},
					
					statusFormatter : function(obj) {
						  if (!obj) return;
						  for(var statusCounter=0;statusCounter< this.statusList.length;statusCounter++)
						  {
							  if(obj == this.statusList[statusCounter].status)
							  {
								  return this.statusList[statusCounter].description;
							  }
						  }
						  return "";
					},
					
					sortFieldsFormatter : function(obj){
						 if (!obj) return;
						 if(obj == "plannedStart"){
							 return this.interfaces.oOEEBundle.getText("OEE_LABEL_PLANNED_START");
						 }
						 if(obj == "status"){
							 return this.interfaces.oOEEBundle.getText("OEE_LABEL_STATUS");
						 }
						 if (obj == "actualStart"){
							 return this.interfaces.oOEEBundle.getText("OEE_LABEL_ACTUAL_START_DATE");
						 }
						 if (obj == "order"){
							 return this.interfaces.oOEEBundle.getText("OEE_LABEL_ORDER");
						 }
						 if (obj == "quantityReleased"){
							 return this.interfaces.oOEEBundle.getText("OEE_LABEL_QUANTITY");
						 }
						 if (obj == "material"){
							 return this.interfaces.oOEEBundle.getText("OEE_LABEL_MATERIAL")
						 }
						 
						 
					},
					statusStyleFormatter : function(obj){
						
						if(obj === sap.oee.ui.oeeConstants.status.NEW)
						 return "kpiTileGood";
						 if(obj === sap.oee.ui.oeeConstants.status.ACTIVE)
						 return "statusActive";
						 if(obj === sap.oee.ui.oeeConstants.status.HOLD)
						 return "kpiTileBad";
						 return "kpiNotApplicable";
			},
					readProductionActivities : function(){
						var prodActivities = this.interfaces.getProductionActivityForNode(this.appData.client,this.appData.plant,this.appData.node.nodeID); 
						if(prodActivities != undefined && prodActivities.ioProductionActivityList != undefined){
							return prodActivities.ioProductionActivityList.results;
						}
					},
					
					productionActivitiesFormatter : function(obj) {
						if (!obj)
							return;
						if (this.prodActivityList != undefined) {
							for ( var prodActivityCounter = 0; prodActivityCounter < this.prodActivityList.length; prodActivityCounter++) {
								if (obj == this.prodActivityList[prodActivityCounter].prodActivity)
									return this.prodActivityList[prodActivityCounter].description;
							}
							return "";
						}
					},
					
					capacitiesFormatter : function(obj){
						if (!obj)
							return;
						if(this.capacityList!=undefined && this.capacityList.details!=undefined && this.capacityList.details.results!=undefined){

							var capacityList = this.capacityList.details.results;
							if (capacityList != undefined) {
								for ( var capacityCounter = 0; capacityCounter < capacityList.length; capacityCounter++) {
									if (obj == capacityList[capacityCounter].nodeId)
										return capacityList[capacityCounter].description;
								}
								return "";
							}
						}
					},
					
					onPressSetCurrent : function(){
						var startDateTemp;
						var buttonToSetCurrent = sap.ui.core.Fragment.byId("enterTimeFragment" ,"setCurrentDateTime");
						var dateObject = new Date(this.interfaces.interfacesGetTimeInMsAfterTimezoneAdjustmentsForTimeStamp(new Date().getTime()));
						if(buttonToSetCurrent.getText() == this.interfaces.oOEEBundle.getText("OEE_BUTTON_SET_CURRENT")){
							this.oEnterTimeModel.setProperty("/startDate", dateObject);
							this.oEnterTimeModel.setProperty("/startTime", dateObject);
						}else{
							startDateTemp = new Date(this.interfaces.interfacesGetTimeInMsAfterTimezoneAdjustmentsForTimeStamp(this.appData.shift.startTimestamp));
							this.oEnterTimeModel.setProperty("/startDate",startDateTemp);
							this.oEnterTimeModel.setProperty("/startTime",startDateTemp);
						}
						this.oEnterTimeModel.refresh();
						var valueStateofEnterTime = sap.ui.core.Fragment.byId("enterTimeFragment","inputTime");
						var valueStateofEnterDate = sap.ui.core.Fragment.byId("enterTimeFragment","inputDate");
						if(valueStateofEnterTime){
							valueStateofEnterTime.setValueState(sap.ui.core.ValueState.None);
						}
						if(valueStateofEnterDate){
							valueStateofEnterDate.setValueState(sap.ui.core.ValueState.None);
						}  
						var okButtonofEnterTime = sap.ui.core.Fragment.byId("enterTimeFragment","okButton1");
						if(okButtonofEnterTime){
							okButtonofEnterTime.setEnabled(true);
						}					
					},
					
					onPressSetCurDate : function(oEvent) {
						var startDateTemp;
						var buttonToSetCurrentTimeForStart = sap.ui.core.Fragment.byId("prodActivitiesFragment" ,"buttonToSetCurrentTimeForStart");
						var dateObject = new Date(this.interfaces.interfacesGetTimeInMsAfterTimezoneAdjustmentsForTimeStamp(new Date().getTime()));
						if(buttonToSetCurrentTimeForStart.getText() == this.interfaces.oOEEBundle.getText("OEE_BUTTON_SET_CURRENT")){
							this.oProductionActivityModel.setProperty("/startDate", dateObject);
							this.oProductionActivityModel.setProperty("/startTime", dateObject);
						}else{
							startDateTemp = new Date(this.interfaces.interfacesGetTimeInMsAfterTimezoneAdjustmentsForTimeStamp(this.appData.shift.startTimestamp));
							this.oProductionActivityModel.setProperty("/startDate",startDateTemp);
							this.oProductionActivityModel.setProperty("/startTime",startDateTemp);
						}
						this.oProductionActivityModel.refresh();
						var valueStateofStartDate= sap.ui.core.Fragment.byId("prodActivitiesFragment","inputStartDate");
						var valueStateofStartTime = sap.ui.core.Fragment.byId("prodActivitiesFragment","inputStartTime");
						if(valueStateofStartDate){
							valueStateofStartDate.setValueState(sap.ui.core.ValueState.None);
						}
						if(valueStateofStartTime){
							valueStateofStartTime.setValueState(sap.ui.core.ValueState.None);
						}
						var okButtonofActivity = sap.ui.core.Fragment.byId("prodActivitiesFragment","okButton");
						if(okButtonofActivity){
							okButtonofActivity.setEnabled(true);
						}
					},
					
					onPressSetCurrentDateForEndTime : function(oEvent){
						var startDateTemp;
						var buttonToSetCurrentTime = sap.ui.core.Fragment.byId("prodActivitiesFragment" ,"buttonToSetCurrentTime");
						var dateObject = new Date(this.interfaces.interfacesGetTimeInMsAfterTimezoneAdjustmentsForTimeStamp(new Date().getTime()));
						if(buttonToSetCurrentTime.getText() == this.interfaces.oOEEBundle.getText("OEE_BUTTON_SET_CURRENT")){
							this.oProductionActivityModel.setProperty("/endDate", dateObject);
							this.oProductionActivityModel.setProperty("/endTime", dateObject);
						}else{
							startDateTemp = new Date(this.interfaces.interfacesGetTimeInMsAfterTimezoneAdjustmentsForTimeStamp(this.appData.shift.startTimestamp));
							this.oProductionActivityModel.setProperty("/endDate",startDateTemp);
							this.oProductionActivityModel.setProperty("/endTime",startDateTemp);
						}
						this.oProductionActivityModel.refresh();
						var endDate = sap.ui.core.Fragment.byId("prodActivitiesFragment", "inputEndDate");
						var endTime = sap.ui.core.Fragment.byId("prodActivitiesFragment", "inputEndTime");
						this.setValueStateOk(endDate);
						this.setValueStateOk(endTime);
					},
					
					setValueStateOk : function(control){
						control.setValueState("None");
						control.setValueStateText(" ");
						sap.ui.core.Fragment.byId("prodActivitiesFragment","okButton").setEnabled(true);
					},
					
					onClickStart : function(showTimeAndActivity) {
						var that = this, fragmentHeader = "";
						var currentDate, dateObject, startDateTemp;
						
						dateObject = new Date(this.interfaces.interfacesGetTimeInMsAfterTimezoneAdjustmentsForTimeStamp(new Date().getTime()));
						if(this.oActivityDialog == undefined){
							this.oActivityDialog = sap.ui.xmlfragment("prodActivitiesFragment","sap.oee.ui.fragments.activityDialog",this);
							this.byId(sap.ui.core.Fragment.createId("prodActivitiesFragment","activities"));
							this.getView().addDependent(this.oActivityDialog);
						}	
						var endDate = sap.ui.core.Fragment.byId("prodActivitiesFragment", "inputEndDate"); // on opening Dialog, ValueState for EndTime should be none
						var endTime = sap.ui.core.Fragment.byId("prodActivitiesFragment", "inputEndTime");
						this.setValueStateOk(endTime);
						this.setValueStateOk(endDate);
						this.initializeStatusModel();
						if(this.selectedOrder.productionActivity != undefined && this.selectedOrder.productionActivity != ""){
							fragmentHeader = this.interfaces.oOEEBundle.getText("OEE_LABEL_SELECT_ACTIVITY");
						}else{
							fragmentHeader = this.interfaces.oOEEBundle.getText("OEE_LABEL_ENTER_STARTTIME_FORORDER")+ " "+ this.selectedOrder.orderNumber;
						}
						var showActivityList = false;
						if(this.prodActivityList.length > 0){
							showActivityList = true;
						}
						if(this.isCurrentShift == true){
							this.oProductionActivityModel.setData({showTimeAndActivity :showTimeAndActivity,
								showActivityList : showActivityList,
								activities:this.prodActivityList, 
								fragmentHeader : fragmentHeader,
								startDate: dateObject,
								startTime: dateObject,
								crewSize:this.selectedOrder.crewSize,
								crewSizeVisibilty : this.appData.node.crewSize}); 
						}else{
							startDateTemp = new Date(this.interfaces.interfacesGetTimeInMsAfterTimezoneAdjustmentsForTimeStamp(this.appData.shift.startTimestamp));
							this.oProductionActivityModel.setData({showTimeAndActivity :showTimeAndActivity,
								showActivityList : showActivityList,
								activities:this.prodActivityList, 
								fragmentHeader : fragmentHeader,
								startDate:startDateTemp,
								startTime:startDateTemp,
								crewSize:this.selectedOrder.crewSize,
								crewSizeVisibilty : this.appData.node.crewSize}); 
						}
						this.oProductionActivityModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
						this.oActivityDialog.setModel(this.oProductionActivityModel);
						if(this.prodActivityList == undefined || this.prodActivityList.length == 0){
							this.oActivityDialog.setContentHeight("20%"); 
						}else{
							this.oActivityDialog.setContentHeight("30%"); 
						}
						this.oActivityDialog.open();
						if(this.selectedOrder.productionActivity != undefined && this.selectedOrder.productionActivity != ""){
							var items = sap.ui.core.Fragment.byId("prodActivitiesFragment","activities").getItems();
							for(i in items){
								if(items[i].getBindingContext().getProperty("prodActivity") == this.selectedOrder.productionActivity){
									items[i].setSelected(true);
								}
							}
						}
					},
					
					initializeStatusModel : function(){
						var descriptionOfStatus={},data = [],dropDown,buttonToSetCurrentTime,curentDateTemp,currentDateTimeStampInUTC;
						this.locale = sap.ui.getCore().getConfiguration().getLocale().toString().substring(0,2);
						var that = this;
						var endDate = sap.ui.core.Fragment.byId("prodActivitiesFragment", "inputEndDate");
						var endTime = sap.ui.core.Fragment.byId("prodActivitiesFragment", "inputEndTime");
						buttonToSetCurrentTime = sap.ui.core.Fragment.byId("prodActivitiesFragment" ,"buttonToSetCurrentTime");
						buttonToSetCurrentTimeForStart = sap.ui.core.Fragment.byId("prodActivitiesFragment" ,"buttonToSetCurrentTimeForStart");
						dropDown = sap.ui.core.Fragment.byId("prodActivitiesFragment", "selectStatus");
						if(!this.oStatusModel){							
							this.oStatusModel = new sap.ui.model.json.JSONModel();
							data = [];
							allStatus = this.interfaces.GetAllStatusWithLang(this.appData.client,this.appData.plant);
							allStatus.statusDTOList.results.forEach(function(elem){
								for(var i=0;i<elem.statusDescDTOList.results.length;i++){
									if(elem.statusDescDTOList.results[i].language === that.locale){
										elem.description = elem.statusDescDTOList.results[i].description;
									}
								} });

							for(i=0;i<allStatus.statusDTOList.results.length;i++){
								if(allStatus.statusDTOList.results[i].status === "ACT"){
									descriptionOfStatus.Active = allStatus.statusDTOList.results[i].description;
								}
								else if(allStatus.statusDTOList.results[i].status === "CMPL"){
									descriptionOfStatus.Completed = allStatus.statusDTOList.results[i].description;
								}
								else if(allStatus.statusDTOList.results[i].status === "HOLD"){
									descriptionOfStatus.Hold = allStatus.statusDTOList.results[i].description;
								}
							}
							data.push({"Key" : "ACT", "value" : descriptionOfStatus.Active});
							data.push({"Key" : "HOLD", "value" : descriptionOfStatus.Hold});
							data.push({"Key" : "CMPL", "value" : descriptionOfStatus.Completed});
							this.oStatusModel.setData({data:data});
							dropDown.setModel(this.oStatusModel);
						}						
						// currentDate = sap.oee.ui.Utils.getPlantTimezoneTime(new Date().getTime(),this.appData.plantTimezoneOffset);
						curentDateTemp = new Date().toUTCString();
						this.setValueStateOk(endTime);
						this.setValueStateOk(endDate);
						currentDateTimeStampInUTC = new Date(curentDateTemp).getTime();
						if(currentDateTimeStampInUTC <= this.appData.shift.endTimestamp && currentDateTimeStampInUTC >= this.appData.shift.startTimestamp){
							dropDown.setSelectedIndex(0);
							endTime.setEnabled(false);
							endDate.setEnabled(false);
							buttonToSetCurrentTime.setText(that.interfaces.oOEEBundle.getText("OEE_BUTTON_SET_CURRENT"));
							buttonToSetCurrentTime.setTooltip(that.interfaces.oOEEBundle.getText("OEE_BUTTON_SET_CURRENT"));
							buttonToSetCurrentTime.setEnabled(false);
							buttonToSetCurrentTimeForStart.setText(that.interfaces.oOEEBundle.getText("OEE_BUTTON_SET_CURRENT"));
							buttonToSetCurrentTimeForStart.setTooltip(that.interfaces.oOEEBundle.getText("OEE_BUTTON_SET_CURRENT"));
							this.isCurrentShift = true;
						}else{
							dropDown.setSelectedIndex(2);
							endTime.setEnabled(true);
							endDate.setEnabled(true);
							buttonToSetCurrentTime.setText(that.interfaces.oOEEBundle.getText("OEE_BTN_SET_SHIFT_START"));
							buttonToSetCurrentTime.setTooltip(that.interfaces.oOEEBundle.getText("OEE_BTN_SET_SHIFT_START"));
							buttonToSetCurrentTime.setEnabled(true);
							buttonToSetCurrentTimeForStart.setText(that.interfaces.oOEEBundle.getText("OEE_BTN_SET_SHIFT_START"));
							buttonToSetCurrentTimeForStart.setTooltip(that.interfaces.oOEEBundle.getText("OEE_BTN_SET_SHIFT_START"));
							this.isCurrentShift = false;
						}
					},
					
					onResumeOrder : function(showTimeAndActivity){
						var dateObject, startDateTemp;

						dateObject = new Date(this.interfaces.interfacesGetTimeInMsAfterTimezoneAdjustmentsForTimeStamp(new Date().getTime()));

						if(this.oActivityDialog == undefined){
							this.oActivityDialog = sap.ui.xmlfragment("prodActivitiesFragment","sap.oee.ui.fragments.activityDialog",this);
							this.byId(sap.ui.core.Fragment.createId("prodActivitiesFragment","activities"));
							this.getView().addDependent(this.oActivityDialog);
						}
						this.initializeStatusModel();
						var fragmentHeader = "";
						/*if(this.selectedOrder.productionActivity != undefined && this.selectedOrder.productionActivity != ""){
							fragmentHeader = this.interfaces.oOEEBundle.getText("OEE_LABEL_SELECT_ACTIVITY");
						}else{*/
						fragmentHeader = this.interfaces.oOEEBundle.getText("OEE_LABEL_ENTER_TIME") + " - "+this.selectedOrder.orderNumber;
						//}
						var showActivityList = false;
						if(this.prodActivityList.length > 0){
							showActivityList = true;
						}
						if(this.isCurrentShift == true){
							this.oProductionActivityModel.setData({showTimeAndActivity :showTimeAndActivity,
								showActivityList : showActivityList,
								activities:this.prodActivityList, 
								fragmentHeader : fragmentHeader,
								startDate: dateObject,
								startTime: dateObject,
								crewSize:this.selectedOrder.crewSize,
								crewSizeVisibilty : this.appData.node.crewSize}); 
						}
						else{
							startDateTemp = new Date(this.interfaces.interfacesGetTimeInMsAfterTimezoneAdjustmentsForTimeStamp(this.appData.shift.startTimestamp));
							this.oProductionActivityModel.setData({showTimeAndActivity :showTimeAndActivity,
								showActivityList : showActivityList,
								activities:this.prodActivityList, 
								fragmentHeader : fragmentHeader,
								startDate:startDateTemp,
								startTime:startDateTemp,
								crewSize:this.selectedOrder.crewSize,
								crewSizeVisibilty : this.appData.node.crewSize}); 
						}
						this.oProductionActivityModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
						this.oActivityDialog.setModel(this.oProductionActivityModel);
						if(this.prodActivityList == undefined || this.prodActivityList.length == 0){
							this.oActivityDialog.setContentHeight("20%"); 
						}else{
							this.oActivityDialog.setContentHeight("30%"); 
						}
						this.oActivityDialog.open();
						if(this.selectedOrder.productionActivity != undefined && this.selectedOrder.productionActivity != ""){
							var items = sap.ui.core.Fragment.byId("prodActivitiesFragment","activities").getItems();
							for(i in items){
								if(items[i].getBindingContext().getProperty("prodActivity") == this.selectedOrder.productionActivity){
									items[i].setSelected(true);
								}
							}
						}
					},
					
					handleOK : function(oEvent){
						var endDateValueTimeStampInUTC , startDateValueTimeStampInUTC,isStartTimeValid,orderStartResumeTime,orderEndTimeStamp,orderEndDate; 
						var startDateValue, startTimeValue, endDateValue, endTimeValue, orderEndResumeTime;

						startDateValue = sap.ui.core.Fragment.byId("prodActivitiesFragment","inputStartDate").getDateValue();
						startTimeValue = sap.ui.core.Fragment.byId("prodActivitiesFragment","inputStartTime").getDateValue();
						endDateValue = sap.ui.core.Fragment.byId("prodActivitiesFragment","inputEndDate").getDateValue();
						endTimeValue = sap.ui.core.Fragment.byId("prodActivitiesFragment","inputEndTime").getDateValue();

						if(startDateValue && startTimeValue && startDateValue !="" && startTimeValue !=""){
							orderStartResumeTime = sap.oee.ui.Utils.createTimestampFromDateTime(startDateValue, startTimeValue);
						}

						if(endDateValue && endTimeValue && endDateValue !="" && endTimeValue !=""){
							orderEndResumeTime = sap.oee.ui.Utils.createTimestampFromDateTime(endDateValue, endTimeValue);
						}

						if(orderStartResumeTime == null || orderStartResumeTime == undefined || orderStartResumeTime == ""){
							sap.oee.ui.Utils.createMessage(this.interfaces.oOEEBundle.getText("OEE_ERR_MSG_ENTER_START_TIME"), sap.ui.core.MessageType.Error);
							return;
						}
						isStartTimeValid = this.validateStartTimeDateForOrder(orderStartResumeTime); // start time in future or not
						if(isStartTimeValid === true && isStartTimeValid !== undefined){ 
							var result = this.validationCheckForEndTimeField();
							if(result === true){ 
								var valueStateStartDate = sap.ui.core.Fragment.byId("prodActivitiesFragment","inputStartDate").getValueState();
								var valueStateEndDate = sap.ui.core.Fragment.byId("prodActivitiesFragment","inputEndDate").getValueState();
								var valueStateStartTime = sap.ui.core.Fragment.byId("prodActivitiesFragment","inputStartTime").getValueState();
								var valueStateEndTime = sap.ui.core.Fragment.byId("prodActivitiesFragment","inputEndTime").getValueState();
								
								if(valueStateStartDate == "None" && valueStateEndDate == "None" && valueStateStartTime == "None" && valueStateEndTime == "None"){
									var selectedProductionActivity = "";
									if(sap.ui.core.Fragment.byId("prodActivitiesFragment","activities").getSelectedItem() != null){
										var selectedProductionActivityContext = sap.ui.core.Fragment.byId("prodActivitiesFragment","activities").getSelectedItem().getBindingContext();
										selectedProductionActivity = selectedProductionActivityContext.getProperty("prodActivity");
									}
									if(!this.oProductionActivityModel.getProperty("/showTimeAndActivity")){
										var result = this.interfaces.changeProductionActivity(this.selectedOrder.runID,selectedProductionActivity) ; 
										if(result.outputCode===0){
											sap.oee.ui.Utils.toast(this.appComponent.oBundle.getText("OEE_MESSAGE_PROD_ACT_CHANGED"));
											this.clearActivityData();
											this.oActivityDialog.close();
											sap.oee.ui.Utils.updateModel(this.oActivityDialog.getModel());
											this.bindOrdersToTable();
										}else{
											sap.oee.ui.Utils.createMessage(result.outputMessage, sap.ui.core.MessageType.Error);
										}
										return;
									}

									startDateValue = orderStartResumeTime;

									startDateValueTimeStampInUTC = this.getUTCForCurrentDate(startDateValue);
									if(orderEndResumeTime !== undefined && orderEndResumeTime !== null){
//										endDateValueTimeStamp = orderEndResumeTime.getTime();
										//var runEndTimeStamp = sap.oee.ui.Utils.removePlantTimezoneTimeOffsetAndSendUTC(endDateValueTimeStamp,this.appData.plantTimezoneOffset);
										endDateValueTimeStampInUTC = this.getUTCForCurrentDate(orderEndResumeTime);
										orderEndTimeStamp = this.removeSecondsFromTime(endDateValueTimeStampInUTC); // value passed in ODataInterface.
									}else{
										orderEndTimeStamp = null;
									}
									jQuery.sap.require("sap.ui.core.format.NumberFormat");
		                    		var floatFormatter= sap.ui.core.format.NumberFormat.getFloatInstance();
									if(this.appData.node.crewSize === sap.oee.ui.oeeConstants.checkBooleanValue.TRUE){
										this.crewSize = sap.ui.core.Fragment.byId("prodActivitiesFragment","crewSize").getValue();
										if(this.crewSize != ""){
											var value = floatFormatter.parse(this.crewSize);
											if(isNaN(value) || value < 0) {
												sap.ui.core.Fragment.byId("prodActivitiesFragment","crewSize").setValue("");
												sap.oee.ui.Utils.createMessage(this.appComponent.oBundle.getText("OEE_ERR_MSG_CREW_SIZE"),sap.ui.core.MessageType.Error);
												return;
											}
											this.crewSize = value;
										}
										else{
											this.crewSize = parseFloat(0);
										}
										

									}else{
										this.crewSize = 0;
									}

									var startTimeString = sap.oee.ui.Formatter.formatDateTimeToString(startDateValue); // this is only the time so not converting it to UTC
									var endTimeString = sap.oee.ui.Formatter.formatDateTimeToString(orderEndResumeTime); // to set value for this.selectedOrder.endTime , this is only the time so not converting it to UTC
									//var startTimeStamp_create= new Date(startDateValue).getTime();
									var startTimeStamp_create = startDateValueTimeStampInUTC;
									/*var shiftStartTime =new Date(this.appData.shift.startDate+' '+this.appData.shift.startTime).getTime();
								var shiftEndTime =new Date(this.appData.shift.endDate+' '+this.appData.shift.endTime).getTime();*/
									var shiftStartTime =this.appData.shift.startTimestamp;
									var shiftEndTime =this.appData.shift.endTimestamp;


									if(startTimeStamp_create>= shiftStartTime && startTimeStamp_create <= shiftEndTime){ // current time is between present shift or not
										var orderStartDate = this.orderStartDateForOverlappingShifts(startTimeString);
										if(orderEndResumeTime !== undefined && orderEndResumeTime !== null && orderEndResumeTime !== "" ){
											// orderEndDate = this.gettingOrderEndDate(orderEndResumeTime);
											orderEndDate = this.gettingOrderEndDate(new Date(endDateValueTimeStampInUTC));
										}
										this.clearActivityData();
										this.oActivityDialog.close();
										sap.oee.ui.Utils.updateModel(this.oActivityDialog.getModel());
										this.selectedOrder.productionActivity = selectedProductionActivity;
										this.selectedOrder.startDate = orderStartDate;
										this.selectedOrder.endDate = orderEndDate;
										this.selectedOrder.startTime = startTimeString;
										this.selectedOrder.endTime =  endTimeString;

										if(this.appData.node.lineBehavior == "MULTI_CAP_SINGLE_LINE" 
											|| this.appData.node.lineBehavior == "MULTI_CAP_SINGLE_LINE_REP_WITH_MULTIPLIER"){
											this.openCapacityDialog(orderStartDate,startTimeString);
										}else{
											try {
												if(this.customData.getValue()== "RESUME"){
													this.onClickResume(orderStartResumeTime);
												}
												else{
													/*var operationStartData = this.interfaces
									.interfacesStartProductionRun(this.selectedOrder.releasedHeaderID,this.selectedOrder.releasedID,this.appData.shift.shiftID,
											this.appData.shift.shiftGrouping,this.appData.shift.workBreakSchedule,
											selectedProductionActivity,
											orderStartDate,startTimeString,undefined,this.crewSize); */
													/*	removeSecondsFromTime(startDateValue.getTime());*/	

													// Setting Order Start Date
													//var runStartTimeStampTemp = new Date(orderStartDate + ' '+ startTimeString).getTime();
													//var runStartTimeStamp = sap.oee.ui.Utils.removePlantTimezoneTimeOffsetAndSendUTC(runStartTimeStampTemp,this.appData.plantTimezoneOffset);
													var runStartTimeStamp = this.getUTCForCurrentDate(new Date(orderStartDate + ' '+ startTimeString));
													var orderStartTimeStamp = this.removeSecondsFromTime(runStartTimeStamp);

													var operationStartResumeData = this.interfaces.startResumeOrder(this.selectedOrder.releasedHeaderID ,this.selectedOrder.releasedID,this.appData.shift.shiftID,
															this.appData.shift.shiftGrouping ,this.appData.shift.workBreakSchedule,selectedProductionActivity ,orderStartTimeStamp,undefined,this.crewSize ,orderEndTimeStamp,this.selectedStatusValue);
													if(operationStartResumeData == undefined){
														return;
													}
													if (operationStartResumeData != undefined) {
														outputCode = operationStartResumeData.outputCode;
														if (outputCode == 0) {
															this.appComponent.getEventBus().publish(this.appComponent.getId(), "orderChange",{runID : operationStartResumeData.runID});
															this.router = this.appComponent.getRouter();
															this.router.navTo("contentArea");
														}else if(outputCode == 1){
															sap.oee.ui.Utils.createMessage(operationStartResumeData.outputMessage,sap.ui.core.MessageType.Error);											
														}
													}
												}
											}
											catch (e) {
												sap.oee.ui.Utils.createMessage(e.message,
														sap.ui.core.MessageType.Error);
											}
										}
									}
									else{
										sap.oee.ui.Utils.createMessage(this.interfaces.oOEEBundle.getText("OEE_MESSAGE_SHIFT_BOUNDARY"), sap.ui.core.MessageType.Error);
										//sap.ui.core.Fragment.byId("prodActivitiesFragment","InputDate").setValueState(sap.ui.core.ValueState.Error);
									}
								}
							}
						}else{
							sap.oee.ui.Utils.createMessage(this.interfaces.oOEEBundle.getText("OEE_ERR_START_TIME_IN_FUTURE"), sap.ui.core.MessageType.Error);
						}
					},
					
					validateStartTimeDateForOrder : function(orderDate){						
						var currentTime,currentTimeStamp,orderDate,orderDateTimeStamp;
						currentTime = new Date().toUTCString();
						currentTimeStamp  = new Date(currentTime).getTime();
						if(orderDate != "" && orderDate != null || orderDate != undefined){
							orderDateTimeStamp = this.getUTCForCurrentDate(orderDate);
						}else{
							return false;
						}
						if(currentTimeStamp < orderDateTimeStamp){
							return false;
						}else{
							return true;
						}
					},
					
					getUTCForCurrentDate : function(date){
						var offsetInMinutes;
						if(date != null && date != undefined && date != ""){
							var browserTimezoneOffset = new Date(date.getTime()).getTimezoneOffset() * 60000;
							var UTCDateInTimeStamp, plantTimezoneOffset = this.appData.plantTimezoneOffset, offsetInMinutes, dateTimeString;
							
							/*
							 * Adjusting plantTimezoneOffset based on DST if applicable
							 */
							if(this.appData){
								dateTimeString = sap.oee.ui.Utils.getDateTimeStringFromTimestamp(date.getTime());
								offsetInMinutes = sap.oee.ui.Utils.getPlantTimezoneOffsetBasedOnTimezoneKey(dateTimeString, this.appData.plantTimezoneKey);
								if(offsetInMinutes){
									plantTimezoneOffset = parseFloat(offsetInMinutes);
								}
							}
							
							UTCDateInTimeStamp = date.getTime() - (browserTimezoneOffset + plantTimezoneOffset);
							return UTCDateInTimeStamp;
						}else{
							return null;
						}
					},
					
					gettingOrderEndDate : function(endDateValueTimeStampTemp){
						var tempOrderEndDate,tempOrderEndMonth,tempOrderEndYear,orderEndDate;
						tempOrderEndDate = this.endDateFormatter(endDateValueTimeStampTemp.getDate());
						tempOrderEndMonth = this.endDateFormatter(endDateValueTimeStampTemp.getMonth() ,true);
						tempOrderEndYear = endDateValueTimeStampTemp.getFullYear();
						orderEndDate = tempOrderEndYear + "/" + tempOrderEndMonth + "/" + tempOrderEndDate;
						return orderEndDate;
					},
					
					validationCheckForEndTimeField : function(){
						var endDateValue,startDateValue ,endTimeValue, startTimeValue, startDateTime, endDateTime, startDateValueTimeStamp,endDateValueTimeStamp;
						this.selectedStatus = sap.ui.core.Fragment.byId("prodActivitiesFragment","selectStatus");
						this.selectedStatusValue = this.selectedStatus.getSelectedKey();
						endDateValue = sap.ui.core.Fragment.byId("prodActivitiesFragment","inputEndDate").getDateValue(); 
						endTimeValue = sap.ui.core.Fragment.byId("prodActivitiesFragment","inputEndTime").getDateValue(); 
						startDateValue = sap.ui.core.Fragment.byId("prodActivitiesFragment","inputStartDate").getDateValue();
						startTimeValue = sap.ui.core.Fragment.byId("prodActivitiesFragment","inputStartTime").getDateValue();

						if(endDateValue && endTimeValue && endDateValue !="" && endTimeValue !=""){
							endDateTime = sap.oee.ui.Utils.createTimestampFromDateTime(endDateValue, endTimeValue);
						}

						if(startDateValue && startTimeValue && startDateValue !="" && startTimeValue !=""){
							startDateTime = sap.oee.ui.Utils.createTimestampFromDateTime(startDateValue, startTimeValue);
						}

						startDateValueTimeStamp = this.getUTCForCurrentDate(startDateTime);
						endDateValueTimeStamp = this.getUTCForCurrentDate(endDateTime);
						if(startDateValueTimeStamp != null && startDateValueTimeStamp != undefined && startDateValueTimeStamp != "" && endDateValueTimeStamp != "" && endDateValueTimeStamp != undefined && endDateValueTimeStamp != null){
							if(startDateValueTimeStamp === endDateValueTimeStamp){     // checking of start time is equal to endtime or not
								sap.oee.ui.Utils.createMessage(this.interfaces.oOEEBundle.getText("START_TIME_EQUALS_END_TIME_ERROR"), sap.ui.core.MessageType.Error);
								return false;
							}else if(startDateValueTimeStamp > endDateValueTimeStamp){ // checking if start time is less than end time or not
								sap.oee.ui.Utils.createMessage(this.interfaces.oOEEBundle.getText("START_TIME_GREATER_THAN_END_TIME"), sap.ui.core.MessageType.Error);
								return false;
							}
						}
						if(this.selectedStatusValue === "CMPL" || this.selectedStatusValue === "HOLD" ){
							if(endDateValue === undefined || endDateValue === null || endDateValue === "" ){
								sap.ui.core.Fragment.byId("prodActivitiesFragment","inputEndDate").setValueState("Error");
								sap.ui.core.Fragment.byId("prodActivitiesFragment","inputEndDate").setValueStateText("Please Enter End Date");
								sap.ui.core.Fragment.byId("prodActivitiesFragment","inputEndTime").setValueState("Error");
								sap.ui.core.Fragment.byId("prodActivitiesFragment","inputEndTime").setValueStateText("Please Enter End Time");
								sap.ui.core.Fragment.byId("prodActivitiesFragment","okButton").setEnabled(false);
								return false;
							}else{
								sap.ui.core.Fragment.byId("prodActivitiesFragment","inputEndDate").setValueState("None");
								sap.ui.core.Fragment.byId("prodActivitiesFragment","inputEndDate").setValueStateText(" ");
								sap.ui.core.Fragment.byId("prodActivitiesFragment","inputEndTime").setValueState("None");
								sap.ui.core.Fragment.byId("prodActivitiesFragment","inputEndTime").setValueStateText(" ");
								sap.ui.core.Fragment.byId("prodActivitiesFragment","okButton").setEnabled(true);
								return true;
							}
						}else{
							sap.ui.core.Fragment.byId("prodActivitiesFragment","inputEndDate").setValueState("None");
							sap.ui.core.Fragment.byId("prodActivitiesFragment","inputEndDate").setValueStateText(" ");
							sap.ui.core.Fragment.byId("prodActivitiesFragment","inputEndTime").setValueState("None");
							sap.ui.core.Fragment.byId("prodActivitiesFragment","inputEndTime").setValueStateText(" ");
							sap.ui.core.Fragment.byId("prodActivitiesFragment","okButton").setEnabled(true);
							return true;
						}

					},
					
					 endDateFormatter : function(val , isMonth){
						 if(isMonth && isMonth !== undefined){
							 val = val+1;
						 }
						return (val < 10)?"0"+val:val;  
					},
					
					removeSecondsFromTime: function(timeStamp){
				    	if(timeStamp){
				        	var dateTime = new Date(parseInt(timeStamp));
				    		var seconds = dateTime.getSeconds();
				    		timeStamp = timeStamp/1000;
				    		timeStamp = timeStamp - seconds;
				    		timeStamp = timeStamp*1000;
				    		return timeStamp;
				        	}
				        	return "";
				        },
					
				        onChangeStatus : function(oEvent){
				        	var endTime, endDate;
				        	var selectedStatus = sap.ui.core.Fragment.byId("prodActivitiesFragment","selectStatus");
				        	endTime = sap.ui.core.Fragment.byId("prodActivitiesFragment", "inputEndTime");
				        	endDate = sap.ui.core.Fragment.byId("prodActivitiesFragment", "inputEndDate");
				        	var selectedStatusValue = selectedStatus.getSelectedKey();
				        	if(selectedStatusValue === "ACT"){
				        		if(endTime.getValueState() === "Error"){
				        			this.setValueStateOk(endTime);							
				        		}
				        		if(endDate.getValueState() === "Error"){
				        			this.setValueStateOk(endDate);							
				        		}
				        		endTime.setDateValue(null);
				        		endTime.setEnabled(false);
				        		endDate.setDateValue(null);
				        		endDate.setEnabled(false);
				        		var buttonToSetCurrentTime = sap.ui.core.Fragment.byId("prodActivitiesFragment" ,"buttonToSetCurrentTime");
				        		buttonToSetCurrentTime.setEnabled(false);
				        	}else if(selectedStatusValue === "CMPL" || selectedStatusValue === "HOLD"){
				        		endTime.setEnabled(true);
				        		endDate.setEnabled(true);
				        		var buttonToSetCurrentTime = sap.ui.core.Fragment.byId("prodActivitiesFragment" ,"buttonToSetCurrentTime");
				        		buttonToSetCurrentTime.setEnabled(true);
				        		this.setValueStateOk(endTime);
				        		this.setValueStateOk(endDate);
				        	}
				        },
					
					handleActivityCancel : function(oEvent){
						this.clearActivityData();
						/*var crewSize = sap.ui.core.Fragment.byId("prodActivitiesFragment","crewSize");
						if(crewSize){
							crewSize.setValue("0");
						}*/
						sap.ui.core.Fragment.byId("prodActivitiesFragment","okButton").setEnabled(true);
						sap.ui.core.Fragment.byId("prodActivitiesFragment","inputStartDate").setValueState(sap.ui.core.ValueState.None);
						sap.ui.core.Fragment.byId("prodActivitiesFragment","inputEndDate").setValueState(sap.ui.core.ValueState.None);
						 if(this.oProductionActivityModel){
						    	this.oProductionActivityModel.setData(null);
						    	this.oProductionActivityModel.updateBindings(true);
						    }
						this.oActivityDialog.close();
					},
					
					clearActivityData : function(){
						 var items = sap.ui.core.Fragment.byId("prodActivitiesFragment","activities").getItems();
						 for(i in items){
						 if(items[i].getSelected()){
						 items[i].setSelected(false);
						 }
						 }
						
					},
					
					handleCancelTime : function(oEvent){
						sap.ui.core.Fragment.byId("enterTimeFragment","okButton1").setEnabled(true);
						sap.ui.core.Fragment.byId("enterTimeFragment","inputDate").setValueState(sap.ui.core.ValueState.None);
						sap.ui.core.Fragment.byId("enterTimeFragment","inputTime").setValueState(sap.ui.core.ValueState.None);
						this.oEnterTimeDialog.close();
					},
					
					onClickHold : function(holdTime) {
						var isStartTimeValid;
						var endDateValue =  holdTime;
						var endTimeString = sap.oee.ui.Formatter.formatDateTimeToString(endDateValue);  // taking out the Time in HH:MM:SS String format
						// var endTimeStamp_create= new Date(endDateValue).getTime();
						var endTimeStamp_create= this.getUTCForCurrentDate(endDateValue); // current value in hold date Time field in UTC
						/*var shiftStartTime =new Date(this.appData.shift.startDate+' '+this.appData.shift.startTime).getTime();
						var shiftEndTime =new Date(this.appData.shift.endDate+' '+this.appData.shift.endTime).getTime();*/
						var shiftStartTime = this.appData.shift.startTimestamp;
						var shiftEndTime = this.appData.shift.endTimestamp; 
						isStartTimeValid = this.validateStartTimeDateForOrder(endDateValue);
						if(isStartTimeValid != null && isStartTimeValid ===true){
						if(endTimeStamp_create >= shiftStartTime && endTimeStamp_create <= shiftEndTime){
						try{
							var orderHoldDate = this.orderStartDateForOverlappingShifts(endTimeString);
						var status =this.interfaces.pauseProductionRun(this.selectedOrder.runID, endTimeStamp_create); // passing the UTC HoldTimestamp to this service so removing conversion from ODataInterface.js
						if(status!==undefined && status!=""){
							if(status.outputCode!=undefined && status.outputCode===0){
								this.appComponent.getEventBus().publish(this.appComponent.getId(), "clearOrderContext",{orderChangePublish : true});
						    	 // this.bindOrdersToTable();
								this.fetchOrdersBasedOnStatus();
							}
							else if(status.outputCode!=undefined && status.outputCode===1){
								sap.oee.ui.Utils.createMessage(status.outputMessage, sap.ui.core.MessageType.Error);
							}else if (status=== undefined || status===''){
								sap.oee.ui.Utils.createMessage(this.interfaces.oOEEBundle.getText("OEE_MESSAGE_UNSUCCESSFUL_PAUSE"), sap.ui.core.MessageType.Error);
							}
						}
						}
						catch(e){
							sap.oee.ui.Utils.createMessage(e.message,sap.ui.core.MessageType.Error);
						}
						}
						else{
							sap.oee.ui.Utils.createMessage(this.interfaces.oOEEBundle.getText("OEE_MESSAGE_SHIFT_BOUNDARY"), sap.ui.core.MessageType.Error);
						}
						}else{
							sap.oee.ui.Utils.createMessage(this.interfaces.oOEEBundle.getText("OEE_ERR_START_TIME_IN_FUTURE"), sap.ui.core.MessageType.Error);
						}
					},
					
					openEnterTimeDialog : function(timeText){
						var startDate = new Date(this.interfaces.interfacesGetTimeInMsAfterTimezoneAdjustmentsForTimeStamp(new Date().getTime()));
						if(this.oEnterTimeDialog == undefined){
							this.oEnterTimeDialog = sap.ui.xmlfragment("enterTimeFragment","sap.oee.ui.fragments.enterTime",this);
							this.getView().addDependent(this.oEnterTimeDialog);
						}

						this.oEnterTimeModel.setData({timeLabel : timeText,
							fragmentHeader : this.interfaces.oOEEBundle.getText("OEE_LABEL_ENTER_TIME") + " - "+this.selectedOrder.orderNumber,
							enterDateTime : false,
							startDate:startDate,
							startTime:startDate});
						this.oEnterTimeModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
						this.oEnterTimeDialog.setModel(this.oEnterTimeModel);
						this.oEnterTimeDialog.open();
					},
					
					checkDateTime : function(oEvent){
						var bValid = oEvent.getParameter("valid");
				    	if (bValid) {
				    		oEvent.oSource.setValueState(sap.ui.core.ValueState.None);
				    	     var okButtonofEnterTime = sap.ui.core.Fragment.byId("enterTimeFragment","okButton1");
						      if(okButtonofEnterTime)
						    	  {
						    	  okButtonofEnterTime.setEnabled(true);
						    	  }
						      var okButtonofActivity = sap.ui.core.Fragment.byId("prodActivitiesFragment","okButton");
						      if(okButtonofActivity)
						    	  {
						    	  okButtonofActivity.setEnabled(true);
						    	  }
						} else {
							oEvent.oSource.setValueState(sap.ui.core.ValueState.Error);
							var okButtonofEnterTime = sap.ui.core.Fragment.byId("enterTimeFragment","okButton1");
						      if(okButtonofEnterTime)
						    	  {
						    	  okButtonofEnterTime.setEnabled(false);
						    	  }
						      var okButtonofActivity = sap.ui.core.Fragment.byId("prodActivitiesFragment","okButton");
						      if(okButtonofActivity)
						    	  {
						    	  okButtonofActivity.setEnabled(false);
						    	  }
							//oEvent.oSource.setValue("");
						}
					},
					
					handleOKTime : function(oEvent){
						var startTime, startDate, combinedDateTime;
						
						var valueStateDate = sap.ui.core.Fragment.byId("enterTimeFragment","inputDate").getValueState();
						var valueStateTime = sap.ui.core.Fragment.byId("enterTimeFragment","inputTime").getValueState();
						startDate = sap.ui.core.Fragment.byId("enterTimeFragment","inputDate").getDateValue();
						startTime = sap.ui.core.Fragment.byId("enterTimeFragment","inputTime").getDateValue();
						if(startTime == null || startTime == undefined || startTime == "" || startDate == null || startDate == undefined || startDate == ""){
							sap.oee.ui.Utils.createMessage(this.interfaces.oOEEBundle.getText("OEE_ERR_MSG_ENTER_START_TIME"), sap.ui.core.MessageType.Error);
							return;
						}
						if(valueStateDate == "None" && valueStateTime == "None"){
							try{
								combinedDateTime = sap.oee.ui.Utils.createTimestampFromDateTime(startDate, startTime);
								if(this.customData.getValue()== sap.oee.ui.oeeConstants.status.HOLD){
									this.onClickHold(combinedDateTime);
								}
								if(this.customData.getValue()== "COMPLETE"){
									this.onClickComplete(combinedDateTime);
								}
								/*if(this.customData.getValue()== "RESUME"){
							this.onResumeOrder(true);
						}*/
							}catch(e){
								sap.oee.ui.Utils.createMessage(e.message,sap.ui.core.MessageType.Error);
							}
							this.oEnterTimeDialog.close();
						}
					},

					onClickResume : function(resumeTime) {
						var endDateValueTimeStamp,orderEndTimeStamp,runStartTimeStampTempInUTC,orderStartTimeStamp, combinedEndDate;
						var resumeDateValue =  resumeTime;
						var resumeTimeString = sap.oee.ui.Formatter.formatDateTimeToString(resumeDateValue); // it is only taking time so not changing it to UTC
//						var resumeTimeStamp_create= new Date(resumeDateValue).getTime();
						var resumeTimeStamp_create= this.getUTCForCurrentDate(resumeDateValue); // UTC Timestamp of resume
						/*var shiftStartTime =new Date(this.appData.shift.startDate+' '+this.appData.shift.startTime).getTime();
						var shiftEndTime =new Date(this.appData.shift.endDate+' '+this.appData.shift.endTime).getTime();*/
						var shiftStartTime = this.appData.shift.startTimestamp;  // taking the UTC timestamp of shifts for comparison.
						var shiftEndTime = this.appData.shift.endTimestamp;

						var endDate = sap.ui.core.Fragment.byId("prodActivitiesFragment","inputEndDate").getDateValue(); 
						var endTime = sap.ui.core.Fragment.byId("prodActivitiesFragment","inputEndTime").getDateValue(); 
						
						if(endDate && endTime && endDate !="" && endTime !=""){
							combinedEndDate = sap.oee.ui.Utils.createTimestampFromDateTime(endDate, endTime);
						}
						
						if(combinedEndDate != undefined){
							orderEndTimeStamp = this.removeSecondsFromTime(this.getUTCForCurrentDate(combinedEndDate)); // value passed in ODataInterface.
						}else{
						    orderEndTimeStamp = null;
						}
						
						runStartTimeStampTempInUTC = this.getUTCForCurrentDate(new Date(this.selectedOrder.startDate + ' '+ this.selectedOrder.startTime));// run startTimeStamp is in UTC
//						var runStartTimeStampTemp = new Date(this.selectedOrder.startDate + ' '+ this.selectedOrder.startTime).getTime();
//						var runStartTimeStamp = sap.oee.ui.Utils.removePlantTimezoneTimeOffsetAndSendUTC(runStartTimeStampTemp,this.appData.plantTimezoneOffset);
						orderStartTimeStamp = this.removeSecondsFromTime(runStartTimeStampTempInUTC);

						if(resumeTimeStamp_create >= shiftStartTime && resumeTimeStamp_create <= shiftEndTime){
							var orderResumeDate = this.orderStartDateForOverlappingShifts(resumeTimeString);
							if(this.appData.node.lineBehavior == "MULTI_CAP_SINGLE_LINE" 
								|| this.appData.node.lineBehavior == "MULTI_CAP_SINGLE_LINE_REP_WITH_MULTIPLIER"){
								this.selectedOrder.startDate = orderResumeDate;
								this.selectedOrder.startTime = resumeTimeString;
								this.openCapacityDialog(orderResumeDate,resumeTimeString);
							}else{
								try{
									/*var resumedOrderJSON = this.interfaces
								.resumeProductionRun(this.selectedOrder.runID,this.appData.shift.shiftID,this.appData.shift.shiftGrouping,
										this.appData.shift.workBreakSchedule,orderResumeDate, 
										resumeTimeString,this.selectedOrder.productionActivity,undefined,this.crewSize);*/  
									var operationStartResumeData = this.interfaces.startResumeOrder(this.selectedOrder.releasedHeaderID ,this.selectedOrder.releasedID,this.appData.shift.shiftID,
											this.appData.shift.shiftGrouping ,this.appData.shift.workBreakSchedule,this.selectedOrder.productionActivity ,orderStartTimeStamp ,this.capacityNodeList,this.crewSize ,orderEndTimeStamp,this.selectedStatusValue,this.selectedOrder.runID);
									if(operationStartResumeData == undefined){
										return;
									}else if (operationStartResumeData != undefined&& operationStartResumeData.outputCode == 0) {
										this.appComponent.getEventBus().publish(this.appComponent.getId(), "orderChange",{runID : operationStartResumeData.runID});
										this.router = this.appComponent.getRouter();
										this.router.navTo("contentArea");
									}else if(operationStartResumeData.outputCode == 1 ){
										sap.oee.ui.Utils.createMessage(operationStartResumeData.outputMessage,sap.ui.core.MessageType.Error);
									}
								}catch(e){
									sap.oee.ui.Utils.createMessage(e.message,sap.ui.core.MessageType.Error);
								}
							}
						}
						else{
							sap.oee.ui.Utils.createMessage(this.interfaces.oOEEBundle.getText("OEE_MESSAGE_SHIFT_BOUNDARY"), sap.ui.core.MessageType.Error);
						}
					},

					onClickComplete : function(endTime) {
						var isStartTimeValid;
						var endDateValue =  endTime;
						var endTimeString = sap.oee.ui.Formatter.formatDateTimeToString(endDateValue); // getting value of End time in HH:MM:SS String format
						// var endTimeStamp_create= new Date(endDateValue).getTime();
						var endTimeStamp_create = this.getUTCForCurrentDate(endDateValue);  // converting the endTime to UTC TimeStamp
						/*var shiftStartTime =new Date(this.appData.shift.startDate+' '+this.appData.shift.startTime).getTime();
						var shiftEndTime =new Date(this.appData.shift.endDate+' '+this.appData.shift.endTime).getTime();*/
						var shiftStartTime = this.appData.shift.startTimestamp;
						var shiftEndTime = this.appData.shift.endTimestamp;
						isStartTimeValid = this.validateStartTimeDateForOrder(endDateValue);
						if(isStartTimeValid != null && isStartTimeValid === true){
						if(endTimeStamp_create>= shiftStartTime && endTimeStamp_create <= shiftEndTime){
						try {
							var orderCompleteDate = this.orderStartDateForOverlappingShifts(endTimeString);
							var stopOrderData = this.interfaces.stopProductionRun(this.selectedOrder.releasedID,this.selectedOrder.releasedHeaderID,orderCompleteDate, endTimeString);
							if(stopOrderData != undefined){
								if(stopOrderData.outputCode == 0){
							this.appComponent.getEventBus().publish(this.appComponent.getId(), "clearOrderContext",{orderChangePublish : true});
							sap.oee.ui.Utils.toast(this.appComponent.oBundle.getText("OEE_MESSAGE_ORDER_COMPLETE"));
							//TODO: need to clarify the navigation here
							//this.bindOrdersToTable();
							this.byId("idActiveStatus").setSelected(true);
							//this.byId("idAllStatus").setSelected(false);
							this.byId("idNewStatus").setSelected(false);
							this.byId("idHoldStatus").setSelected(false);
							this.byId("idCompletedStatus").setSelected(false);
							this.fetchOrdersBasedOnStatus();
							//this.filterOrderData();
								}
								else{
									sap.oee.ui.Utils.createMessage(stopOrderData.outputMessage,sap.ui.core.MessageType.Error);
								}
							}
							//this.byId('idOrdersTable').getBinding("items").filter(new sap.ui.model.Filter("status","EQ",sap.oee.ui.oeeConstants.status.ACTIVE));
							
						} catch (e) {
							sap.oee.ui.Utils.createMessage(e.message,sap.ui.core.MessageType.Error);
						}
						}
						else{
							sap.oee.ui.Utils.createMessage(this.interfaces.oOEEBundle.getText("OEE_MESSAGE_SHIFT_BOUNDARY"), sap.ui.core.MessageType.Error);
						}
						}else{
							sap.oee.ui.Utils.createMessage(this.interfaces.oOEEBundle.getText("OEE_ERR_START_TIME_IN_FUTURE"), sap.ui.core.MessageType.Error);
						}
					},

					bindOrdersToTable : function() {
						var orderOperationJSON;
						this.byId("idOrdersTable").setBusy(true);
						/*var orderOperationJSON = this.interfaces
								.interfacesGetReleasedDemandInputForTimePeriodAndPatternAsync(this.appData.plant,this.appData.node.nodeID,this.appData.client,
											this.appData.shift.startTimestamp, [ sap.oee.ui.oeeConstants.status.NEW,sap.oee.ui.oeeConstants.status.COMPLETED, sap.oee.ui.oeeConstants.status.HOLD, sap.oee.ui.oeeConstants.status.ACTIVE, sap.oee.ui.oeeConstants.status.ABORTED ],null,this.renderOrderDetails,this.getView().getController());*/
						if(this.appData.filtersForManageOrder.selectedFilterForManageOrders.length > 0){
							orderOperationJSON = this.interfaces
						.interfacesGetReleasedDemandInputForTimePeriodAndPatternAsync(this.appData.plant,this.appData.node.nodeID,this.appData.client,
									this.appData.shift.startTimestamp,this.appData.shift.endTimestamp,this.appData.filtersForManageOrder.selectedFilterForManageOrders, this.appData.filtersForManageOrder.orderBasedOnCurrentShift, null,this.renderOrderDetails,this.getView().getController());  
						}else{
							orderOperationJSON = this.interfaces
						.interfacesGetReleasedDemandInputForTimePeriodAndPatternAsync(this.appData.plant,this.appData.node.nodeID,this.appData.client,
									this.appData.shift.startTimestamp,this.appData.shift.endTimestamp, [sap.oee.ui.oeeConstants.status.ACTIVE],this.appData.filtersForManageOrder.orderBasedOnCurrentShift ,null,this.renderOrderDetails,this.getView().getController());  
						}
					},
					renderOrderDetails :function(orderOperationJSON){
						this.orderDetails = [];
						if (orderOperationJSON != undefined) {
							if(orderOperationJSON.outputCode == 1){
								this.byId("idOrdersTable").setBusy(false);
								sap.oee.ui.Utils.createMessage(orderOperationJSON.outputMessage, sap.ui.core.MessageType.Error);
								return;
							}

							if (orderOperationJSON.orderDetails != undefined) {
								if (orderOperationJSON.orderDetails.results != undefined
										&& orderOperationJSON.orderDetails.results.length > 0) {

									for ( var i = 0; i < orderOperationJSON.orderDetails.results.length; i++) {
										var orderData = orderOperationJSON.orderDetails.results[i];

										if (orderData.operations != undefined) {
											if (orderData.operations.results != undefined
													&& orderData.operations.results.length > 0) {

												for ( var j = 0; j < orderData.operations.results.length; j++) {
													var orderOperationData = {};
													var operationData = orderData.operations.results[j];
													if(operationData.subOperations != undefined && operationData.subOperations.results != undefined){
														for(var n=0; n< operationData.subOperations.results.length; n++){
															var subOperationOrderData = {};
															var subOperationData = operationData.subOperations.results[n];
															this.setOrderOperationData(subOperationOrderData,orderData,subOperationData);
														}
													}else{
														this.setOrderOperationData(orderOperationData,orderData,operationData);
													}
												}
											}
										}
									}
								}
									this.orderOperationJSONModel.setData( {orderDetails : this.orderDetails});
									this.byId("idOrdersTable").setModel(this.orderOperationJSONModel);
									//this.byId("idNewStatus").setSelected(true);
									//this.filterOrderData();
									this.byId("idOrdersTable").setBusy(false);
								
							}
						}
					},
					
					setOrderOperationData: function(orderOperationData,orderData,operationData){
						orderOperationData.action1Visible = false;
						orderOperationData.action2Visible = false;
						orderOperationData.action3Visible = false;
						orderOperationData.action3Enabled = true;
						
						orderOperationData.action1Enabled = true;
						orderOperationData.action2Enabled = true;
						//orderOperationData.rowIndex = j;

						orderOperationData.order = orderData.order;
						orderOperationData.orderNo = sap.oee.ui.Formatter.formatOrderNo(orderData.order);
						orderOperationData.material = orderData.material;
						orderOperationData.releasedHeaderID = orderData.releasedHeaderID;
						orderOperationData.plannedStartDate = orderData.scheduledStartDate;
						orderOperationData.plannedStartTime = orderData.scheduledStartTime;
						orderOperationData.plannedFinishDate = orderData.scheduledFinishDate;
						orderOperationData.plannedFinishTime = orderData.scheduledFinishTime;
						orderOperationData.materialDescription = orderData.materialHeader.materialDescription;
						orderOperationData.startDate = operationData.startDate;
						orderOperationData.startTime = operationData.startTime;
						orderOperationData.endDate = operationData.endDate;
						orderOperationData.endTime = operationData.endTime;
						
						if(operationData.routingOperNo != undefined && operationData.routingOperNo != ""){
						orderOperationData.routingOperNo = operationData.routingOperNo;
						orderOperationData.operationDesc = operationData.operationDesc;
						}
						if(operationData.parentOperationNo != undefined && operationData.parentOperationNo != ""){
							orderOperationData.parentOperNo = operationData.parentOperationNo;
							orderOperationData.parentOperationDesc = operationData.parentOperationDesc;
						}
						orderOperationData.releasedID = operationData.releasedID;
						orderOperationData.productionMode = operationData.productionMode;
						if(this.appData.defaultUom != undefined){
							if(this.appData.defaultUom.value == sap.oee.ui.oeeConstants.uomType.productionUom){
								orderOperationData.quantityReleased = operationData.quantityReleasedInProductionUom;
								orderOperationData.quantityReleasedUOM = operationData.quantityReleasedProductionUOM;
							}else{
								orderOperationData.quantityReleased = operationData.quantityReleased;
								orderOperationData.quantityReleasedUOM = operationData.quantityReleasedUOM;
							}
						} 
						else{
							orderOperationData.quantityReleased = operationData.quantityReleased;
							orderOperationData.quantityReleasedUOM = operationData.quantityReleasedUOM;
							}
						
						orderOperationData.status = operationData.releaseDemandStatus;
						orderOperationData.numberOfCapacities = operationData.numberOfCapacities;
						orderOperationData.statusDesc = this.statusFormatter(orderOperationData.status);
						orderOperationData.runID = operationData.runID;
						orderOperationData.detailsVisible = true;
						if (operationData.releaseDemandStatus == sap.oee.ui.oeeConstants.status.NEW) {
							orderOperationData.action1Label = this.interfaces.oOEEBundle.getText("OEE_BTN_START");
							orderOperationData.action1Visible = true;
							orderOperationData.targetAction1 = sap.oee.ui.oeeConstants.orderTargetActions.START;
							orderOperationData.action1Icon ="sap-icon://fob-watch";
							orderOperationData.detailsVisible = false;
						}
						if (operationData.releaseDemandStatus == sap.oee.ui.oeeConstants.status.HOLD) {
							orderOperationData.startDate = operationData.startDate;
							orderOperationData.startTime = operationData.startTime;
							orderOperationData.action1Label = this.interfaces.oOEEBundle.getText("OEE_BTN_RESUME");
							//orderOperationData.action2Label = this.interfaces.oOEEBundle.getText("OEE_BTN_COMPLETE");
							
							orderOperationData.action1Visible = true;
							//orderOperationData.action2Visible = true;
							
							if(this.prodActivityList != undefined && this.prodActivityList.length>0){
								orderOperationData.action3Visible = true;
								this.byId("productionActivityColumn").setVisible(true);
							}
							if(operationData.productionActivity != undefined && operationData.productionActivity != ""){
								orderOperationData.action3Label = this.productionActivitiesFormatter(operationData.productionActivity);
								orderOperationData.productionActivity = operationData.productionActivity;
							}else{
								orderOperationData.productionActivity = this.interfaces.oOEEBundle.getText("OEE_BTN_ASSIGN");
								orderOperationData.action3Label = this.interfaces.oOEEBundle.getText("OEE_BTN_ASSIGN");
							}
							orderOperationData.targetAction1 = sap.oee.ui.oeeConstants.orderTargetActions.RESUME;
							//orderOperationData.targetAction2 = "COMPLETE";
							orderOperationData.targetAction3 = sap.oee.ui.oeeConstants.orderTargetActions.ACTIVITY;
							orderOperationData.action1Icon ="sap-icon://media-play";
							orderOperationData.action2Icon ="sap-icon://flag";
							orderOperationData.action3Icon ="sap-icon://activity-2";
							orderOperationData.action3Enabled = false;
						}
						if (operationData.releaseDemandStatus == sap.oee.ui.oeeConstants.status.ACTIVE) {
							orderOperationData.startDate = operationData.startDate;
							orderOperationData.startTime = operationData.startTime;
							orderOperationData.action1Label = this.interfaces.oOEEBundle.getText("OEE_LABEL_HOLD");
							orderOperationData.action2Label = this.interfaces.oOEEBundle.getText("OEE_BTN_COMPLETE");
							
							orderOperationData.startTime = operationData.startTime;
							orderOperationData.action1Visible = true;
							orderOperationData.action2Visible = true;
							if(this.prodActivityList != undefined && this.prodActivityList.length>0){
								orderOperationData.action3Visible = true;
								this.byId("productionActivityColumn").setVisible(true);
							}
							if(operationData.productionActivity != undefined && operationData.productionActivity != ""){
								orderOperationData.action3Label = this.productionActivitiesFormatter(operationData.productionActivity);
								orderOperationData.productionActivity = operationData.productionActivity;
							}else{
								orderOperationData.productionActivity = this.interfaces.oOEEBundle.getText("OEE_BTN_ASSIGN");
								orderOperationData.action3Label = this.interfaces.oOEEBundle.getText("OEE_BTN_ASSIGN");
							}
							
							orderOperationData.targetAction1 = sap.oee.ui.oeeConstants.status.HOLD;
							orderOperationData.targetAction2 = sap.oee.ui.oeeConstants.orderTargetActions.COMPLETE;
							orderOperationData.targetAction3 = sap.oee.ui.oeeConstants.orderTargetActions.ACTIVITY;
							orderOperationData.action1Icon ="sap-icon://media-pause";
							orderOperationData.action2Icon ="sap-icon://flag";
							orderOperationData.action3Icon ="sap-icon://activity-2";
							
							// If run is active in selected shift, then only allow order to be completed or put on hold
							var enableActionButtons = this.hasActiveRunInSelectedShift(operationData);
							orderOperationData.action1Enabled = enableActionButtons;
							orderOperationData.action2Enabled = enableActionButtons;
							orderOperationData.action3Enabled = enableActionButtons;
						}
						if (operationData.releaseDemandStatus == sap.oee.ui.oeeConstants.status.ABORTED) {
							orderOperationData.startDate = operationData.startDate;
							orderOperationData.startTime = operationData.startTime;
							orderOperationData.action1Label = this.interfaces.oOEEBundle.getText("OEE_LABEL_HOLD");
							orderOperationData.action2Label = this.interfaces.oOEEBundle.getText("OEE_BTN_COMPLETE");
							
							orderOperationData.startTime = operationData.startTime;
							orderOperationData.action1Visible = true;
							orderOperationData.action2Visible = true;
							if(this.prodActivityList != undefined && this.prodActivityList.length>0){
								orderOperationData.action3Visible = true;
								this.byId("productionActivityColumn").setVisible(true);
							}
							if(operationData.productionActivity != undefined && operationData.productionActivity != ""){
								orderOperationData.action3Label = this.productionActivitiesFormatter(operationData.productionActivity);
								orderOperationData.productionActivity = operationData.productionActivity;
							}else{
								orderOperationData.productionActivity = this.interfaces.oOEEBundle.getText("OEE_BTN_ASSIGN");
								orderOperationData.action3Label = this.interfaces.oOEEBundle.getText("OEE_BTN_ASSIGN");
							}
							
							orderOperationData.targetAction1 = sap.oee.ui.oeeConstants.status.HOLD;
							orderOperationData.targetAction2 = sap.oee.ui.oeeConstants.orderTargetActions.COMPLETE;
							orderOperationData.targetAction3 = sap.oee.ui.oeeConstants.orderTargetActions.ACTIVITY;
							orderOperationData.action1Icon ="sap-icon://media-pause";
							orderOperationData.action2Icon ="sap-icon://flag";
							orderOperationData.action3Icon ="sap-icon://activity-2";
							orderOperationData.action3Enabled = false;
						}
						if (operationData.crewSize !== "") {
							orderOperationData.crewSize = operationData.crewSize; 
						}
						
						orderOperationData.defaultUomText = this.interfaces.interfacesGetTextForUOM(orderOperationData.quantityReleasedUOM); // amit
						//orderOperationData.salesOrderNumber = operationData.salesOrderNumber;
						this.orderDetails.push(orderOperationData);
						
					},
					
					hasActiveRunInSelectedShift : function(operationData){
						return (operationData.reportingShiftEndTimestamp == this.appData.shift.endTimestamp &&
								operationData.reportingShiftStartTimestamp == this.appData.shift.startTimestamp);
					},
					
					action1 : function(oEvent) {
						var selectedRowContext = oEvent.getSource().getBindingContext();
						this.selectedOrder.status = this.orderOperationJSONModel.getProperty("status", selectedRowContext);
						this.selectedOrder.orderNumber = this.orderOperationJSONModel.getProperty("order", selectedRowContext);
						this.selectedOrder.material = this.orderOperationJSONModel.getProperty("material", selectedRowContext);
						this.selectedOrder.releasedHeaderID = this.orderOperationJSONModel.getProperty("releasedHeaderID",selectedRowContext);
						this.selectedOrder.releasedID = this.orderOperationJSONModel.getProperty("releasedID", selectedRowContext);
						this.selectedOrder.productionMode = this.orderOperationJSONModel.getProperty("productionMode",selectedRowContext);
						this.selectedOrder.startDate = this.orderOperationJSONModel.getProperty("startDate",selectedRowContext);
						this.selectedOrder.quantityReleased = this.orderOperationJSONModel.getProperty("quantityReleased",selectedRowContext);
						this.selectedOrder.quantityReleasedUOM = this.orderOperationJSONModel.getProperty("quantityReleasedUOM",selectedRowContext);
						this.selectedOrder.runID = this.orderOperationJSONModel.getProperty("runID",selectedRowContext);
						this.selectedOrder.productionActivity = this.orderOperationJSONModel.getProperty("productionActivity",selectedRowContext);
						this.selectedOrder.numberOfCapacities = this.orderOperationJSONModel.getProperty("numberOfCapacities",selectedRowContext);
						
						if(selectedRowContext.getObject().crewSize){
						this.selectedOrder.crewSize = oEvent.getSource().getBindingContext().getObject().crewSize; 
						}
							
						
							this.customData = oEvent.getSource().getCustomData()[0];
						if (this.selectedOrder.status === sap.oee.ui.oeeConstants.status.NEW) {
							this.onClickStart(true);
						}

						if (this.selectedOrder.status === sap.oee.ui.oeeConstants.status.ACTIVE) {
							
							this.openEnterTimeDialog(this.interfaces.oOEEBundle.getText("OEE_LABEL_HOLD_TIME"));
						}
						
						if(this.selectedOrder.status === sap.oee.ui.oeeConstants.status.HOLD) {
							this.onResumeOrder(true);
							//this.openEnterTimeDialog(this.interfaces.oOEEBundle.getText("OEE_LABEL_RESUME_TIME"));
							//this.onClickResume(oEvent);
						}
						
						if (this.selectedOrder.status === sap.oee.ui.oeeConstants.status.ABORTED) {
							this.openEnterTimeDialog(this.interfaces.oOEEBundle.getText("OEE_LABEL_HOLD_TIME"));
						}
					},

					action2 : function(oEvent) {
						var selectedRowContext = oEvent.getSource().getBindingContext();

						this.selectedOrder.status = this.orderOperationJSONModel.getProperty("status", selectedRowContext);
						this.selectedOrder.orderNumber = this.orderOperationJSONModel.getProperty("order", selectedRowContext);
						this.selectedOrder.material = this.orderOperationJSONModel.getProperty("material", selectedRowContext);
						this.selectedOrder.releasedHeaderID = this.orderOperationJSONModel.getProperty("releasedHeaderID",selectedRowContext);
						this.selectedOrder.releasedID = this.orderOperationJSONModel.getProperty("releasedID", selectedRowContext);
						this.selectedOrder.productionMode = this.orderOperationJSONModel.getProperty("productionMode",selectedRowContext);
						this.selectedOrder.startDate = this.orderOperationJSONModel.getProperty("startDate",selectedRowContext);
						this.selectedOrder.quantityReleased = this.orderOperationJSONModel.getProperty("quantityReleased",selectedRowContext);
						this.selectedOrder.quantityReleasedUOM = this.orderOperationJSONModel.getProperty("quantityReleasedUOM",selectedRowContext);
						this.selectedOrder.runID = this.orderOperationJSONModel.getProperty("runID",selectedRowContext);
						this.selectedOrder.productionActivity = this.orderOperationJSONModel.getProperty("productionActivity",selectedRowContext);
						this.customData = oEvent.getSource().getCustomData()[0];
						if (this.selectedOrder.status === sap.oee.ui.oeeConstants.orderTargetActions.RESUME || this.selectedOrder.status === sap.oee.ui.oeeConstants.status.HOLD
								|| this.selectedOrder.status === sap.oee.ui.oeeConstants.status.ACTIVE || this.selectedOrder.status === sap.oee.ui.oeeConstants.status.ABORTED) {
							this.openEnterTimeDialog(this.interfaces.oOEEBundle.getText("OEE_LABEL_END_TIME"));
						}
					},
					action3 : function(oEvent) {
						var selectedRowContext = oEvent.getSource().getBindingContext();

						this.selectedOrder.status = this.orderOperationJSONModel.getProperty("status", selectedRowContext);
						this.selectedOrder.orderNumber = this.orderOperationJSONModel.getProperty("order", selectedRowContext);
						this.selectedOrder.material = this.orderOperationJSONModel.getProperty("material", selectedRowContext);
						this.selectedOrder.releasedHeaderID = this.orderOperationJSONModel.getProperty("releasedHeaderID",selectedRowContext);
						this.selectedOrder.releasedID = this.orderOperationJSONModel.getProperty("releasedID", selectedRowContext);
						this.selectedOrder.productionMode = this.orderOperationJSONModel.getProperty("productionMode",selectedRowContext);
						this.selectedOrder.startDate = this.orderOperationJSONModel.getProperty("startDate",selectedRowContext);
						this.selectedOrder.quantityReleased = this.orderOperationJSONModel.getProperty("quantityReleased",selectedRowContext);
						this.selectedOrder.quantityReleasedUOM = this.orderOperationJSONModel.getProperty("quantityReleasedUOM",selectedRowContext);
						this.selectedOrder.runID = this.orderOperationJSONModel.getProperty("runID",selectedRowContext);
						this.selectedOrder.productionActivity = this.orderOperationJSONModel.getProperty("productionActivity",selectedRowContext);
						this.customData = oEvent.getSource().getCustomData()[0];
						this.onClickStart(false);
					},

					filterOrderBasedOnStatus : function(oEvent) {
						this.filterOrderData();
					},
					
					fetchOrdersBasedOnStatus : function(oEvent){
						var newCheckBox = this.byId("idNewStatus").getSelected();
						var activeCheckBox = this.byId("idActiveStatus").getSelected();
						var holdCheckBox = this.byId("idHoldStatus").getSelected();
						var completedCheckBox = this.byId("idCompletedStatus").getSelected();
						var abortedCheckBox = this.byId("idAbortedStatus").getSelected();
						var shiftCheckBox = this.byId("idShiftCheckbox").getSelected();
						
						var oFilter = [];
						this.appData.filtersForManageOrder.selectedFilterForManageOrders = [];
						this.appData.filtersForManageOrder.orderBasedOnCurrentShift = false;
						
						if(newCheckBox){
						oFilter.push(sap.oee.ui.oeeConstants.status.NEW);
						this.appData.filtersForManageOrder.selectedFilterForManageOrders.push(sap.oee.ui.oeeConstants.status.NEW);
						}
						
						if(activeCheckBox){
						oFilter.push(sap.oee.ui.oeeConstants.status.ACTIVE);
						this.appData.filtersForManageOrder.selectedFilterForManageOrders.push(sap.oee.ui.oeeConstants.status.ACTIVE);
						}
						
						if(holdCheckBox){
						oFilter.push(sap.oee.ui.oeeConstants.status.HOLD);
						this.appData.filtersForManageOrder.selectedFilterForManageOrders.push(sap.oee.ui.oeeConstants.status.HOLD);
						}
						
						if(completedCheckBox){
							oFilter.push(sap.oee.ui.oeeConstants.status.COMPLETED);
							this.appData.filtersForManageOrder.selectedFilterForManageOrders.push(sap.oee.ui.oeeConstants.status.COMPLETED);
						}
						
						if(abortedCheckBox){
							oFilter.push(sap.oee.ui.oeeConstants.status.ABORTED);
							this.appData.filtersForManageOrder.selectedFilterForManageOrders.push(sap.oee.ui.oeeConstants.status.ABORTED);
						}
						this.byId("idOrdersTable").setBusy(true);
						
						if(shiftCheckBox){
							this.appData.filtersForManageOrder.orderBasedOnCurrentShift = true;
						}
						
						if(oFilter.length>0){
						this.interfaces
						.interfacesGetReleasedDemandInputForTimePeriodAndPatternAsync(this.appData.plant,this.appData.node.nodeID,this.appData.client,
									this.appData.shift.startTimestamp, this.appData.shift.endTimestamp, oFilter, this.appData.filtersForManageOrder.orderBasedOnCurrentShift,null,this.renderOrderDetails,this.getView().getController());
					  }
						else{
							this.interfaces
									.interfacesGetReleasedDemandInputForTimePeriodAndPatternAsync(this.appData.plant,this.appData.node.nodeID,this.appData.client,
												this.appData.shift.startTimestamp,this.appData.shift.endTimestamp, [ sap.oee.ui.oeeConstants.status.NEW,sap.oee.ui.oeeConstants.status.COMPLETED, sap.oee.ui.oeeConstants.status.HOLD, sap.oee.ui.oeeConstants.status.ACTIVE, sap.oee.ui.oeeConstants.status.ABORTED ],this.appData.filtersForManageOrder.orderBasedOnCurrentShift, null,this.renderOrderDetails,this.getView().getController());
							
						}
						
						
					},
					
					
					filterOrderData : function(){
						//var allCheckBox = this.byId("idAllStatus").getSelected();
						var newCheckBox = this.byId("idNewStatus").getSelected();
						var activeCheckBox = this.byId("idActiveStatus").getSelected();
						var holdCheckBox = this.byId("idHoldStatus").getSelected();
						var completedCheckBox = this.byId("idCompletedStatus").getSelected();
						var abortedCheckBox = this.byId("idAbortedStatus").getSelected();
						/*if(newCheckBox || activeCheckBox || holdCheckBox || completedCheckBox ){
							allCheckBox = false;
							this.byId("idAllStatus").setSelected(false);
						}*/
						var oFilter = [];
						var newFilter = new sap.ui.model.Filter("status", "EQ", sap.oee.ui.oeeConstants.status.NEW);
						var activeFilter = new sap.ui.model.Filter("status", "EQ", sap.oee.ui.oeeConstants.status.ACTIVE);
						var holdFilter = new sap.ui.model.Filter("status", "EQ", sap.oee.ui.oeeConstants.status.HOLD);
						var completedFilter = new sap.ui.model.Filter("status", "EQ" ,sap.oee.ui.oeeConstants.status.COMPLETED);
						var abortedFilter = new sap.ui.model.Filter("status", "EQ" ,sap.oee.ui.oeeConstants.status.ABORTED);
						
						/*if(allCheckBox){
							oFilter.push(newFilter);
							oFilter.push(activeFilter);
							oFilter.push(holdFilter);
							oFilter.push(completedFilter);
						}*/
						
						if(newCheckBox){
						oFilter.push(newFilter);
						}
						
						if(activeCheckBox){
						oFilter.push(activeFilter);
						}
						
						if(holdCheckBox){
						oFilter.push(holdFilter);
						}
						
						if(completedCheckBox){
							oFilter.push(completedFilter);
						}
						
						if(abortedCheckBox){
							oFilter.push(abortedFilter);
						}
						this.currentFilters = oFilter;
						
						if(this.byId('idOrdersTable').getBinding("items") != undefined)
						this.byId('idOrdersTable').getBinding("items").filter(oFilter);
						this.onSearch();
					},
					
					
					onExit : function(){
						if(this.oActivityDialog != undefined){
							this.oActivityDialog.destroy();
						}

						if(this.oEnterTimeDialog != undefined){
							this.oEnterTimeDialog.destroy();
						}
						if(this.oSortDialog != undefined){
							this.oSortDialog.destroy();
						}

						if(this.oCapacityDialog != undefined){
							this.oCapacityDialog.destroy();
						}
						
						this.appComponent.getEventBus().unsubscribe(this.appComponent.getId(), "shiftChanged", this.refreshOrderData, this);
					},
					refreshOrderData :function(oEvent){
						this.fetchOrdersBasedOnStatus(oEvent);
						//this.bindOrdersToTable();
						
					},
					
					sortOrderData : function(oEvent){
						if(this.oSortDialog == undefined){
							this.oSortDialog = sap.ui.xmlfragment("sortFragment","sap.oee.ui.fragments.sortDialog",this);
							this.byId(sap.ui.core.Fragment.createId("sortFragment","sortFields"));
							this.byId(sap.ui.core.Fragment.createId("sortFragment","sortTypes"));
							this.getView().addDependent(this.oSortDialog);
						}
						var sortFields = [];
						sortFields.push("plannedStart");
						sortFields.push("status");
						sortFields.push("actualStart");
						sortFields.push("order");
						sortFields.push("quantityReleased");
						sortFields.push("material");
						this.oSortModel.setData({sortFields:sortFields});
							this.oSortModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
							this.oSortDialog.setModel(this.oSortModel);
						this.oSortDialog.open();
					
					},
					handleSortOK : function(oEvent){
						if(sap.ui.core.Fragment.byId("sortFragment","sortFields").getSelectedItem() != null){
							var sortDescending = false;
							if(sap.ui.core.Fragment.byId("sortFragment","sortTypes").getSelectedItem() != null){
								if(sap.ui.core.Fragment.byId("sortFragment","sortTypes").getSelectedItem().getProperty("label") == this.interfaces.oOEEBundle.getText("OEE_LABEL_DESCENDING")){
									sortDescending = true;
								}
							}
							var oSorter = [];
							if(sap.ui.core.Fragment.byId("sortFragment","sortFields").getSelectedItem().getProperty("label") == this.interfaces.oOEEBundle.getText("OEE_LABEL_STATUSH")){
								var oStatusSorter = new sap.ui.model.Sorter("status",sortDescending);
								oSorter.push(oStatusSorter);
							}
							if(sap.ui.core.Fragment.byId("sortFragment","sortFields").getSelectedItem().getProperty("label") == "Planned Start"){
								var oStartDateSorter = new sap.ui.model.Sorter("plannedStartDate",sortDescending);
								var oStartTimeSorter = new sap.ui.model.Sorter("plannedStartTime",sortDescending);
								oSorter.push(oStartDateSorter);
								oSorter.push(oStartTimeSorter);
								}
							if(sap.ui.core.Fragment.byId("sortFragment","sortFields").getSelectedItem().getProperty("label") == this.interfaces.oOEEBundle.getText("OEE_LABEL_ACTUAL_START_DATE")){
								var oStartDateSorter = new sap.ui.model.Sorter("startDate",sortDescending);
								var oStartTimeSorter = new sap.ui.model.Sorter("startTime",sortDescending);
								oSorter.push(oStartDateSorter);
								oSorter.push(oStartTimeSorter);
								}
							if(sap.ui.core.Fragment.byId("sortFragment","sortFields").getSelectedItem().getProperty("label") == this.interfaces.oOEEBundle.getText("OEE_LABEL_ORDER")){
								var oStatusSorter = new sap.ui.model.Sorter("order",sortDescending);
								oSorter.push(oStatusSorter);
							}
							if(sap.ui.core.Fragment.byId("sortFragment","sortFields").getSelectedItem().getProperty("label") == this.interfaces.oOEEBundle.getText("OEE_LABEL_QUANTITY")){
								var oStatusSorter = new sap.ui.model.Sorter("quantityReleased",sortDescending);
								oSorter.push(oStatusSorter);
							}
							if(sap.ui.core.Fragment.byId("sortFragment","sortFields").getSelectedItem().getProperty("label") == this.interfaces.oOEEBundle.getText("OEE_LABEL_MATERIAL")){
								var oStatusSorter = new sap.ui.model.Sorter("material",sortDescending);
								oSorter.push(oStatusSorter);
							}
							this.byId('idOrdersTable').getBinding("items").sort(oSorter);
							 }
						this.oSortDialog.close();
						
					},
					
					openCapacityDialog :function(orderStartDate,orderStartTime){
						if(this.oCapacityDialog == undefined){
							this.oCapacityDialog = sap.ui.xmlfragment("selectCapacityFragment","sap.oee.ui.fragments.selectCapacityDialog",this);
							this.capacityListInDialog = sap.ui.getCore().byId(sap.ui.core.Fragment.createId("selectCapacityFragment","capacities"));
							this.searchCapacity = sap.ui.getCore().byId(sap.ui.core.Fragment.createId("selectCapacityFragment","searchCapacity"));
							sap.ui.getCore().byId(sap.ui.core.Fragment.createId("selectCapacityFragment","capacityCheckBox"));
							this.getView().addDependent(this.oCapacityDialog);
						}
						var	fragmentHeader = this.interfaces.oOEEBundle.getText("OEE_HEADING_SEL_CAPACITY_FOR_ORDER")+ " "+this.selectedOrder.orderNumber;
						this.capacityList = this.interfaces.getCapacityNodesForParentNode(this.appData.node.nodeID,orderStartDate,orderStartTime);
						
						for(var i=0; i < this.capacityList.details.results.length; i++){
							var capacity = this.capacityList.details.results[i];
							
							capacity.selected = false;
						}
						var map ={};
						map.clearButtonPressed = true;
						this.searchCapacity.fireSearch(map);
						
						this.oSelectCapacityModel.setData({
							capacities:this.capacityList.details.results, 
							fragmentHeader : fragmentHeader,
							numberOfCapacities : this.interfaces.oOEEBundle.getText("OEE_LABEL_SELECT")+ " "+this.selectedOrder.numberOfCapacities+ " "+this.interfaces.oOEEBundle.getText("OEE_LABEL_CAPACITIES")
							});
							//this.oSelectCapacityModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
							this.oCapacityDialog.setModel(this.oSelectCapacityModel);
						this.oCapacityDialog.open();
					},
					
					handleCapacityOK : function(oEvent){
						var selectedCapacityValues = [], combinedEndDate;
						this.capacityNodeList = [];
						var selectedCapacitiesCount = 0;
						for(var i=0; i< this.capacityList.details.results.length; i++){
							var capacity = this.capacityList.details.results[i];
							if(capacity.selected){
								var capacityNode = {};
								capacityNode.nodeID = capacity.nodeId;
								capacityNode.client = this.appData.client;
								capacityNode.plant = this.appData.plant;
								this.capacityNodeList.push(capacityNode);
								selectedCapacitiesCount++;
							}
						}
						if(selectedCapacitiesCount != parseInt(this.selectedOrder.numberOfCapacities)){
							sap.oee.ui.Utils.createMessage(this.interfaces.oOEEBundle.getText("OEE_ERR_MSG_INCORRECT_NUM_CAP"),sap.ui.core.MessageType.Error);
							return;
						}
						try {
							var endDate = sap.ui.core.Fragment.byId("prodActivitiesFragment","inputEndDate").getDateValue(); 
							var endTime = sap.ui.core.Fragment.byId("prodActivitiesFragment","inputEndTime").getDateValue(); 

							if(endDate && endTime && endDate !="" && endTime !=""){
								combinedEndDate = sap.oee.ui.Utils.createTimestampFromDateTime(endDate, endTime);
							}

							if(combinedEndDate != undefined){
								var orderEndTimeStamp = this.removeSecondsFromTime(this.getUTCForCurrentDate(combinedEndDate)); 
							}else{
								var orderEndTimeStamp = null;
							}
							//var runStartTimeStampTemp = new Date(this.selectedOrder.startDate + ' '+ this.selectedOrder.startTime).getTime();
							/*var runStartTimeStamp = sap.oee.ui.Utils.removePlantTimezoneTimeOffsetAndSendUTC(runStartTimeStampTemp,this.appData.plantTimezoneOffset);
									var orderStartTimeStamp = this.removeSecondsFromTime(runStartTimeStamp);*/
							var runStartTimeStampInUTC = this.getUTCForCurrentDate(new Date(this.selectedOrder.startDate + ' '+ this.selectedOrder.startTime));
							var orderStartTimeStamp = this.removeSecondsFromTime(runStartTimeStampInUTC);
							if(this.customData.getValue()== "RESUME"){									
//								operationStartResumeData = this.interfaces.resumeProductionRun(this.selectedOrder.runID,this.appData.shift.shiftID,this.appData.shift.shiftGrouping,
//								this.appData.shift.workBreakSchedule,this.selectedOrder.startDate, 
//								this.selectedOrder.startTime, this.selectedOrder.productionActivity, this.capacityNodeList);
								var operationStartResumeData = this.interfaces.startResumeOrder(this.selectedOrder.releasedHeaderID ,this.selectedOrder.releasedID,this.appData.shift.shiftID,
										this.appData.shift.shiftGrouping ,this.appData.shift.workBreakSchedule,this.selectedOrder.productionActivity ,orderStartTimeStamp ,this.capacityNodeList,this.crewSize ,orderEndTimeStamp,this.selectedStatusValue,this.selectedOrder.runID);
							}else{
//								operationStartResumeData = this.interfaces
//								.interfacesStartProductionRun(this.selectedOrder.releasedHeaderID,this.selectedOrder.releasedID,this.appData.shift.shiftID,
//								this.appData.shift.shiftGrouping,this.appData.shift.workBreakSchedule,
//								this.selectedOrder.productionActivity,
//								this.selectedOrder.startDate,this.selectedOrder.startTime,this.capacityNodeList,this.crewSize);
								var operationStartResumeData = this.interfaces.startResumeOrder(this.selectedOrder.releasedHeaderID ,this.selectedOrder.releasedID,this.appData.shift.shiftID,
										this.appData.shift.shiftGrouping ,this.appData.shift.workBreakSchedule,this.selectedOrder.productionActivity ,orderStartTimeStamp ,this.capacityNodeList,this.crewSize ,orderEndTimeStamp,this.selectedStatusValue);
							}
							if(operationStartResumeData == undefined){
								return;
							}
							if (operationStartResumeData != undefined) {
								outputCode = operationStartResumeData.outputCode;
								if (outputCode == 1) {
									sap.oee.ui.Utils.createMessage(operationStartResumeData.outputMessage,sap.ui.core.MessageType.Error);
								}else if(outputCode == 0){
									this.appComponent.getEventBus().publish(this.appComponent.getId(), "orderChange",{runID : operationStartResumeData.runID});
									this.router = this.appComponent.getRouter();
									this.router.navTo("contentArea");

								}
							}

						}
						catch (e) {
							sap.oee.ui.Utils.createMessage(e.message,
									sap.ui.core.MessageType.Error);
						}
						this.oCapacityDialog.close();
					},
					
					orderStartDateForOverlappingShifts : function(time){
						var orderStartDate;
						if(time){
							if(this.appData.shift.startDate == this.appData.shift.endDate){
								orderStartDate = this.appData.shift.startDate;
							}
							else{ // In Case of Overlapping Shifts
								
								var hour = parseInt(time.slice(0,2));
					    		var shiftStarthour = parseInt(this.appData.shift.startTime.slice(0,2));
					    		if(hour >= 0  && hour< shiftStarthour){
					    			orderStartDate = this.appData.shift.endDate;	
					    		}
					    		else { // Default to shift start Date if outside zone
									orderStartDate = this.appData.shift.startDate;					
								}
							}
						}
						return orderStartDate;
					},
					
					navigateToOrderDetails : function(oEvent){
						var selectedRowContext = oEvent.getSource().getBindingContext();
						//this.appComponent.getEventBus().publish(this.appComponent.getId(), "orderChange",{runID : this.orderOperationJSONModel.getProperty("runID",selectedRowContext)});
						this.appData.selected.order.orderNo =  this.orderOperationJSONModel.getProperty("order",selectedRowContext);
						this.appData.selected.operationNo =  this.orderOperationJSONModel.getProperty("routingOperNo",selectedRowContext);
						this.appData.selected.releasedID =  this.orderOperationJSONModel.getProperty("releasedID",selectedRowContext);
						this.router = this.appComponent.getRouter();
						// need to check if some constants can be used to navigate to activityID
						this.router.navTo("activity",{activityId :sap.oee.ui.oeeConstants.defaultWorkerUIActivites.ACTIVITY_ORDER_DETAILS_SELECTION,mode:this.orderOperationJSONModel.getProperty("runID",selectedRowContext)});
					},
					
					onSearch : function(oEvent){
						var properties = [];
						//properties =Object.getOwnPropertyNames(this.orderOperationJSONModel.oData.orderDetails[0]);
						properties.push("statusDesc");
						properties.push("order");
						properties.push("routingOperNo");
						properties.push("material");
						properties.push("materialDescription");
						properties.push("plannedStartDate");
						properties.push("plannedStartTime");
						properties.push("quantityReleased");
						properties.push("quantityReleasedUOM");
						properties.push("operationDesc");

						sap.oee.ui.Utils.fuzzySearch(this,this.orderOperationJSONModel,this.byId("orderSearch").getValue(),
								this.byId("idOrdersTable").getBinding("items"),null,properties,
								this.currentFilters);
						
					},
					
					onSearchCapacityDialog : function(oEvent){
						var properties = [];
						//properties =Object.getOwnPropertyNames(this.orderOperationJSONModel.oData.orderDetails[0]);
						properties.push("description");

						sap.oee.ui.Utils.fuzzySearch(this,this.oSelectCapacityModel,oEvent.getSource().getValue(),
								this.capacityListInDialog.getBinding("items"),oEvent.getSource(),properties);
						
					},
					
					handleClose : function(oEvent){
						oEvent.getSource().getParent().close();
					},
					
					handleCancel : function(oEvent){
						oEvent.getSource().getParent().close();
					},
					
					checkIfStatusPresent : function(obj1){
						if(obj1 == undefined || "" == obj1)
							return false;
						else return true;
					}
				


				});