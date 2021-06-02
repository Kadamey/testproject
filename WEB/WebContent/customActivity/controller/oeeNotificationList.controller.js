sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageToast",
        "customActivity/scripts/transactionCaller",
        "sap/ui/core/Fragment",
        "sap/m/Dialog",
        "sap/m/Text",
        "sap/m/TextArea",
        "sap/m/Button",
        "sap/m/library",
        "sap/m/MessageBox",
    ],

    function (
        Controller,
        JSONModel,
        MessageToast,
        TransactionCaller,
        Fragment,
        Dialog,
        Text,
        TextArea,
        Button,
        mobileLibrary,
        MessageBox
    ) {
        "use strict";
        var that;
        return Controller.extend(
            "customActivity.controller.oeeNotificationList",

            {
             

                onInit: function() {
    				jQuery.sap.require("sap.ui.core.format.NumberFormat");
    				this.appComponent = this.getView().getViewData().appComponent;
    				this.appData = this.appComponent.getAppGlobalData(); 
    				this.interfaces = this.appComponent.getODataInterface();
    				this.getStatus();
    				this.getnotificationDuration();
    				this.bindMachineList();
    				this.appComponent.getEventBus().subscribe(
    						this.appComponent.getId(), "shiftChanged",
    						this.onRefresh, this);
    				this.prepareFunctionalLocationDialog();
    				this.prepareFilterModel();
					this.initializeNotif();
				//	this.getReasonCodes();

    			},

    			bindMachineList: function() {
    				this.prepareWorkUnitDetails();
    				var payload = {
    						controller: this,
    						fItemSelect: this.onSelectWU,
    						sFragmentId: "machineListFragment",
    						data: this.workUnitList // Optional Parameter data - Pass if overriding needed if not passed  only machine List will be populated, it is being sent here as it is a variant and needs technical object as well when processing on selecting an item
    						// Optional Parameter markBottleneck - if bottleneck has to be marked in List
    						// Optional Parameter dcElementForBottleneck - if you want to determine bottleneck for a particular DCELEMENT example UNSCHEDULED DOWNTIME
    						// Optional Parameter template as parameter - if default parameter needs to be overriden
    						// Optional Parameter properties to be shown not more than 3 can be passed as parameters, which shall be shown including machine name(first property is assumed to be machine description if data is passed by you) if default template is used They also are used for search
    				};
    				sap.oee.ui.Utils.bindMachineList(payload); // Last three params optional, Pass data only if different than list of machines needed, Properties List to show in the item template, Template override if need arises to not use default template.
    			},

    			getnotificationDuration: function() {
    				this.PMNotificationduration = "";
    				if (this.getView().getViewData().viewOptions && this.getView().getViewData().viewOptions.length > 0) {
    					for (var i = 0; i < this.getView().getViewData().viewOptions.length; i++) {
    						if (this.getView().getViewData().viewOptions[i].activityOptionValueDTOList && this.getView().getViewData().viewOptions[i].activityOptionValueDTOList.results && this.getView().getViewData().viewOptions[i].activityOptionValueDTOList.results.length > 0) {
    							if (this.getView().getViewData().viewOptions[i].optionName === "DURATION" && this.getView().getViewData().viewOptions[i].activityOptionValueDTOList.results.length > 0) {
    								for (var j = 0; j < this.getView()
    								.getViewData().viewOptions[i].activityOptionValueDTOList.results.length; j++) {
    									if (this.getView().getViewData().viewOptions[i].activityOptionValueDTOList.results[j].optionName === "DURATION" && this.getView()
    											.getViewData().viewOptions[i].activityOptionValueDTOList.results[j].optionValue !== null) {
    										this.PMNotificationduration = this
    										.getView()
    										.getViewData().viewOptions[i].activityOptionValueDTOList.results[j].optionValue;
    									}
    								}
    							} else {
    								this.PMNotificationduration = "";
    							}
    						}
    					}
    				}

    			},
    			getStatus: function() {
    				this.status = {
    						"NEW": this.appComponent.oBundle.getText('OEE_LABEL_STATUS_NEW'),
    						"E_C": this.appComponent.oBundle.getText('OEE_LABEL_STATUS_EC'),
    						"REJ": this.appComponent.oBundle.getText('OEE_LABEL_STATUS_REJ'),
    						"E_N": this.appComponent.oBundle.getText('OEE_LABEL_STATUS_EN'),
    						"E_F": this.appComponent.oBundle.getText('OEE_LABEL_STATUS_EF'),
    						"E_U": this.appComponent.oBundle.getText('OEE_LABEL_STATUS_EU'),
    						"UPD": this.appComponent.oBundle.getText('OEE_LABEL_STATUS_UPD')
    				};
    			},

    			prepareWorkUnitDetails: function() {
    				this.workUnitList = [];
    				var node = sap.oee.ui.Utils.getMachineListForCurrentWC(false); // Set First Parameter to true if bottleneck machine details needed, pass dcElement for which bottleneck info is needed

    				var nodeDetails = node.details.results;
    				if (nodeDetails !== undefined && nodeDetails.length > 0) {
    					for (var i = 0; i < nodeDetails.length; i++) {
    						var wuTemp = {};
    						var technicalObjects = [];
    						var technicalObj = nodeDetails[i].assignedTechnicalObjects.results;
    						wuTemp.nodeID = nodeDetails[i].nodeId;
    						wuTemp.description = nodeDetails[i].description;
    						wuTemp.name = nodeDetails[i].name;
    						wuTemp.nodeType = nodeDetails[i].type;
    						if (technicalObj !== undefined && technicalObj.length > 0) {
    							for (var t = 0; t < technicalObj.length; t++) {
    								var technicalObject = {};
    								technicalObject.equipment = technicalObj[t].equipmentID;
    								technicalObject.fLoc = technicalObj[t].flocID;
    								technicalObjects.push(technicalObject);
    							}
    						}
    						wuTemp.technicalObject = technicalObjects;
    						this.workUnitList.push(wuTemp);
    					}
    				}
    			},

    			onChangeTypePM: function(oEvent) {
    				var startDate, startTime, startDateTime, endDate, endTime, endDateTime;
    				startDate = sap.ui.core.Fragment.byId("notifDialog", "startDateforPMNotification").getDateValue();
    				startTime = sap.ui.core.Fragment.byId("notifDialog", "startTimeforPMNotification").getDateValue();

    				startDateTime = this.getDateObjectFromUI(startDate, startTime);

    				if (startDateTime != undefined && startDateTime != "") {

    					this.notifData.startDate = startDateTime;
    					this.notifData.startTime = startDateTime;
    					this.notifData.startTimeStamp = startDateTime.getTime();

    					endDate = sap.ui.core.Fragment.byId("notifDialog", "endDateforPMNotification").getDateValue();
    					endTime = sap.ui.core.Fragment.byId("notifDialog", "endTimeforPMNotification").getDateValue();
    					endDateTime = this.getDateObjectFromUI(endDate, endTime);
    					var duration = sap.ui.core.Fragment.byId("notifDialog", "durationforPMNotification").getValue();

    					if (endDateTime != undefined && endDateTime != "") {
    						this.notifData.endDate = endDateTime;
    						this.notifData.endTime = endDateTime;
    						this.notifData.endTimeStamp = endDateTime.getTime();

    						if (this.notifData.endTimeStamp < this.notifData.startTimeStamp) {
    							sap.oee.ui.Utils.createMessage(this.appComponent.oBundle.getText("START_TIME_GREATER_THAN_END_TIME_ERROR"), sap.ui.core.MessageType.Error);
    							return;
    						}
    					}
    				}
    				var comments = sap.ui.core.Fragment.byId("notifDialog", "commentsForPMNotification").getValue();
    				if (comments != undefined && comments != "") {
    					this.notifData.comments = comments;
    				}
    				var actsAsBreakdown = sap.ui.core.Fragment.byId("notifDialog", "breakDownForPMNotification").getSelected();
    				if (actsAsBreakdown != undefined && actsAsBreakdown != "") {
    					this.notifData.actsAsBreakdown = actsAsBreakdown;
    				}

    				this.oFLocDialog.setTitle(this.appComponent.oBundle.getText("OEE_LABEL_SELECT_TECHINALOBJECT"));


    				this.oFLocDialog.open();
    			},

    			prepareFunctionalLocationDialog: function() {
    				if (this.oFLocDialog == undefined) {
    					this.oFLocDialog = sap.ui.xmlfragment("FunctionalLocation","sap.oee.ui.fragments.technicalObjectDialog",this);
    					this.oTechObj = sap.ui.core.Fragment.byId("FunctionalLocation", "techTable");
    					this.oFLocDialog.setTitle(this.appComponent.oBundle.getText("OEE_LABEL_SELECT_TECHINALOBJECT"));
    					this.getView().addDependent(this.oFLocDialog);
    				}
    			},

    			onSelectWU: function(oEvent) {
    				this.getView().byId("notifTable").removeSelections();
    				this.selectedWU = oEvent.getParameter("listItem").getBindingContext().getObject();
    				this.bindDatatoDetail();
    			},

    			handleNotificationSearch: function(oEvent) {
    				var properties = [];
    				properties.push("flocID", "equipmentID", "statusDesc","notificationNo", "changedBy");
    				sap.oee.ui.Utils.fuzzySearch(this,this.oNotifDetailsModel, oEvent.getSource().getValue(), this.getView().byId('notifTable').getBinding("items"),oEvent.getSource(), properties);
    			},

    			bindDatatoDetail: function() {
    				this.getView().byId("notifTable").removeSelections();
    				this.getView().byId("rejectButtonNotification").setEnabled(false);
    				this.getView().byId("approveButtonNotification").setEnabled(false);
    				this.getView().byId("deleteButtonNotification").setEnabled(false);
    				this.getView().byId("syncButtonNotification").setEnabled(false);
    				this.getView().byId("updateButtonNotification").setEnabled(false); 
    				var notifDetails = {};
    				if (!this.oNotifDetailsModel) {
    					this.oNotifDetailsModel = new sap.ui.model.json.JSONModel();
    				}

    				var results = undefined;
    				notifDetails.plant = this.appData.plant;
    				notifDetails.client = this.appData.client;
    				notifDetails.nodeID = this.selectedWU.nodeID;


    				var startTime = null;
    				var endTime = null;
    				var startTimeStamp = null;
    				var endTimeStamp = null;
    				var oeeNotificationStatusList = [];
    				var checkdurationPattern = /\d+/g;
    				checkdurationPattern.lastIndex = 0;

    				if (this.startTimefilter !== undefined && this.startTimefilter !== null || this.endTimefilter !== undefined && this.endTimefilter) {
    					startTime = this.startTimefilter;
    					endTime = this.endTimefilter;
    				} else if (this.appData.shift.startTimestamp && this.appData.shift.endTimestamp) {
    					startTime = this.appData.shift.startTimestamp;
    					endTime = this.appData.shift.endTimestamp;
    				} else {
    					endTime = new Date();
    					startTime = new Date();
    					if (checkdurationPattern.test(this.PMNotificationduration) === true || this.PMNotificationduration === "") {
    						if (this.PMNotificationduration !== "") {
    							startTime = startTime.setHours(endTime.getHours() - parseInt(this.PMNotificationduration));
    						} else {
    							startTime = startTime.setHours(endTime.getHours() - 4);
    						}
    					} else {
    						sap.oee.ui.Utils.createMessage(this.appComponent.oBundle.getText("OEE_MSG_VALID_DURATION"),sap.ui.core.MessageType.Warning);
    						startTime = startTime.setHours(endTime.getHours() - 4);
    					}
    					endTime = endTime.getTime();
    				}
    				endTimeStamp = sap.oee.ui.Utils.removePlantTimezoneTimeOffsetAndSendUTC(endTime,this.appData.plantTimezoneOffset);
    				startTimeStamp = sap.oee.ui.Utils.removePlantTimezoneTimeOffsetAndSendUTC(startTime,this.appData.plantTimezoneOffset);
    				if (this.statusSelectedKeyFilter !== undefined && this.statusSelectedKeyFilter.length > 0) {
    					oeeNotificationStatusList = this.statusSelectedKeyFilter;
    				} else {
    					oeeNotificationStatusList = null;
    				}
    				results = this.interfaces.retrievePMNotifications(notifDetails.client, notifDetails.plant,notifDetails.nodeID, oeeNotificationStatusList,startTimeStamp, endTimeStamp);
    				var notifications = this._mapPMNotificationStatus(results.notifications.results);
    				this.oNotifDetailsModel.setData({notificationDetails: notifications});
    				this.getView().byId('notifTable').setModel(this.oNotifDetailsModel);
    				this.oNotifDetailsModel.refresh(true);
    			},

    			onRefresh: function() {
    				this.bindDatatoDetail();
    			},

    			handleCloseForTechnicalObjects: function() {
    				this.oFLocDialog.close();
    			},

    			checkNotifType: function(client, plant, nodeID) {
    				var notif_data = [];
    				var notifdata = this.interfaces.getAllCustomizationValuesForNode(client,plant,nodeID,sap.oee.ui.oeeConstants.customizationNames.notificationType);
    				return notifdata;
    			},

    			onPressReportNotification: function() {
    				this.initializeNotif(); 
    				this.reportNotificationMode = "NEW";
    				this.techObjData = [];
    				var check_notifType = this.checkNotifType(this.appData.client, this.appData.plant,this.selectedWU.nodeID);
    				if (check_notifType.outputCode !== 1) {
    					if (check_notifType.customizationValues.results.length > 0) {
    						this.notificationType = check_notifType.customizationValues.results;
    						for (var i = 0; i < this.selectedWU.technicalObject.length; i++) {
    							if (this.selectedWU.technicalObject[i].equipment !== "" || this.selectedWU.technicalObject[i].fLoc !== "") {
    								this.techObjData.push(this.selectedWU.technicalObject[i]);
    							}
    						}
    						if (this.techObjData !== undefined) {
    							this.techModel = new sap.ui.model.json.JSONModel();
    							this.techModel.setData({techObjData: this.techObjData});
    							this.oTechObj.setModel(this.techModel);
    							var oBindingInfo = {};
    							oBindingInfo.path = "/techObjData";
    							oBindingInfo.factory = jQuery.proxy(function(sId, oContext) {
    								var oFL = oContext.getProperty('fLoc');
    								var oEquip = oContext.getProperty('equipment');
    								var oTemplate = new sap.m.ColumnListItem({cells: [
    								                                                  new sap.m.Text({text: "{fLoc}"}),
    								                                                  new sap.m.Text({text: "{path :'equipment', formatter:'sap.oee.ui.Formatter.formatRemoveLeadingZero'}"})
    								                                                  ],
    								                                                  type: "Active",
    								                                                  press: [this.handleOKForFLDialog,this]
    								});

    								return oTemplate;
    							}, this);
    							this.oTechObj.bindAggregation('items', oBindingInfo);
    							this.oTechObj.rerender();

    						}
    						this.oFLocDialog.open();
    					} else {
    						sap.oee.ui.Utils.createMessage(this.appComponent.oBundle.getText("OEE_MESSAGE_MAINTAIN_PM_NOTIFICATION_TYPE"),sap.ui.core.MessageType.Error);
    					}
    				}
    			},

    			initializeNotif: function() {
    				this.notifData = {};
    				this.notifData.duration = null;
    				this.notifData.notificationType = null;
    				this.notifData.actsAsBreakdown = false;
    				this.notifData.startTime = undefined;
    				this.notifData.endTime = undefined;
    				this.notifData.startDate = undefined;
    				this.notifData.endDate = undefined;
    				this.notifData.comments = undefined;
    			},

    			handleSearchForTechnicalObjects: function(oEvent) {
    				var properties = [];
    				properties.push("fLoc", "equipment");

    				sap.oee.ui.Utils.fuzzySearch(this, this.techModel, oEvent.getSource().getValue(), this.oTechObj.getBinding("items"), oEvent.getSource(), properties);
    			},

    			//handleOKForFLDialog: function(oEvent) {
					handleOKForFLDialog2: function(oEvent) {
    				if (this.oNotifDialog == undefined) {
    					this.oNotifDialog = sap.ui.xmlfragment("notifDialog","customActivity.view.fragments.PMNotificationDialog",this);
    					this.byId(sap.ui.core.Fragment.createId("notifDialog","startTimeforPMNotification"));
    					this.byId(sap.ui.core.Fragment.createId("notifDialog", "endTimeforPMNotification"));
    					this.byId(sap.ui.core.Fragment.createId("notifDialog", "endDateforPMNotification"));
    					this.byId(sap.ui.core.Fragment.createId("notifDialog", "startDateforPMNotification"));
    					this.byId(sap.ui.core.Fragment.createId( "notifDialog","durationforPMNotification"));
    					this.byId(sap.ui.core.Fragment.createId("notifDialog","commentsForPMNotification"));
						this.byId(sap.ui.core.Fragment.createId("notifDialog","breakDownForPMNotification"));
						this.byId(sap.ui.core.Fragment.createId("notifDialog","reasonCodeCombo"));
    						this.byId(sap.ui.core.Fragment.createId("notifDialog","pmWorkCenterCombo"));
    					this.byId(sap.ui.core.Fragment.createId("notifDialog", "typeforNotif"));
    					this.getView().addDependent(this.oNotifDialog);
    				} else {
    					sap.ui.core.Fragment.byId("notifDialog","startTimeforPMNotification").setEnabled(true);
    					sap.ui.core.Fragment.byId("notifDialog","endTimeforPMNotification").setEnabled(true);
    					sap.ui.core.Fragment.byId("notifDialog", "endDateforPMNotification").setEnabled(true);
    					sap.ui.core.Fragment.byId("notifDialog", "startDateforPMNotification").setEnabled(true);
    					sap.ui.core.Fragment.byId("notifDialog","durationforPMNotification").setEnabled(true);
    					sap.ui.core.Fragment.byId("notifDialog","setCurrentForStartTimePM").setEnabled(true);
						sap.ui.core.Fragment.byId("notifDialog","setCurrentForEndTimePM").setEnabled(true);
						sap.ui.core.Fragment.byId("notifDialog","reasonCodeCombo").setEnabled(true);
						sap.ui.core.Fragment.byId("notifDialog","pmWorkCenterCombo").setEnabled(true);
					
    				}
    				if (!this.oNotifReportingModel) {
    					this.oNotifReportingModel = new sap.ui.model.json.JSONModel();
    				}
    				var type = sap.ui.core.Fragment.byId("notifDialog","typeforPMNotification");
    				var selected = oEvent.getSource().getBindingContext().getObject();
    				this.notifData.nodeDesc = this.selectedWU.description;
    				this.notifData.nodeID = this.selectedWU.nodeID;
    				this.notifData.fLocation = selected.fLoc;
    				this.notifData.equipment = selected.equipment;
    				var check_notifType = this.checkNotifType(this.appData.client, this.appData.plant,this.selectedWU.nodeID);
    				if (check_notifType.outputCode !== 1) {
    					if (check_notifType.customizationValues.results.length > 0) {
    						this.notificationType = check_notifType.customizationValues.results;
    					}
    				}
    				//

    				this.notificationTypeValue();	

    				this.oNotifReportingModel.setData({
    					notificationDataForModel: this.notifData
    				});
    				//
    				this.oNotifReportingModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
    				this.oNotifReportingModel.setProperty("/startTime",this.notifData.startTime);
    				this.oNotifReportingModel.setProperty("/endTime", this.notifData.endTime);
    				this.oNotifReportingModel.setProperty("/startDate",this.notifData.startDate);
    				this.oNotifReportingModel.setProperty("/endDate", this.notifData.endDate);
    				//
    				this.oNotifDialog.setModel(this.oNotifReportingModel);
    				if(this.reportNotificationMode === "UPDATE"){
    					this.oNotifDialog.setTitle(this.appComponent.oBundle.getText("OEE_LABEL_UPDATE_NOTIFICATION"));
    				}else{
    					this.oNotifDialog.setTitle(this.appComponent.oBundle.getText("OEE_LABEL_CREATE_NOTIFICATION"));
    				}
    				this.handleCloseForTechnicalObjects();
    				this.oNotifDialog.open();
    			},

    			notificationTypeValue : function(){
    				if(this.reportNotificationMode === "UPDATE" && this.selectedPMNotification.notificationNo !== "" ){
    					this.notifData.notificationType = this.selectedPMNotification.notificationType;	
    					sap.ui.core.Fragment.byId("notifDialog","SinglePMNotificationType").setVisible(true);
    					sap.ui.core.Fragment.byId("notifDialog","MultiPMNotificationType").setVisible(false);
    				}
    				else{
    					if (this.notificationType && this.notificationType.length > 0) {
    						if (this.notificationType.length === 1) {
    							sap.ui.core.Fragment.byId("notifDialog","SinglePMNotificationType").setVisible(true);
    							sap.ui.core.Fragment.byId("notifDialog","MultiPMNotificationType").setVisible(false);
    							this.notifData.notificationType = this.notificationType[0].value;
    						} else {
    							sap.ui.core.Fragment.byId("notifDialog","SinglePMNotificationType").setVisible(false);
    							sap.ui.core.Fragment.byId("notifDialog","MultiPMNotificationType").setVisible(true);
    							var changeNotificationType = sap.ui.core.Fragment.byId("notifDialog", "MultiValue").getSelectedKey();
    							if(this.reportNotificationMode === "UPDATE"){
    								sap.ui.core.Fragment.byId("notifDialog", "MultiValue").setSelectedKey(changeNotificationType);
    							}
    							else{
    								sap.ui.core.Fragment.byId("notifDialog", "MultiValue").setSelectedKey(this.notificationType[0].value);
    							}

    							this.notifData.notificationTypes = this.notificationType;
    						}
    					}

    				}
    			},

    			handleCancelForPMDialog: function() {
    				this.oNotifDialog.close();
    			},

    			onPressResetStartDatePM: function() {
    				var currentTimeStamp, dateObject;
    				currentTimeStamp = this.interfaces.interfacesGetTimeInMsAfterTimezoneAdjustmentsForTimeStamp(new Date().getTime());
    				this.notifData.startTimeStamp = currentTimeStamp;
    				dateObject = new Date(currentTimeStamp);

    				this.oNotifReportingModel.setProperty("/startDate", dateObject);
    				this.oNotifReportingModel.setProperty("/startTime", dateObject);
    				this.oNotifReportingModel.refresh();        

    				this.setStartTimePM();
    			},

    			onPressResetEndDatePM: function() {
    				var currentTimeStamp, dateObject;
    				currentTimeStamp = this.interfaces.interfacesGetTimeInMsAfterTimezoneAdjustmentsForTimeStamp(new Date().getTime());
    				this.notifData.endTimeStamp = currentTimeStamp;
    				dateObject = new Date(currentTimeStamp);

    				this.oNotifReportingModel.setProperty("/endDate", dateObject);
    				this.oNotifReportingModel.setProperty("/endTime", dateObject);
    				this.oNotifReportingModel.refresh();        
    				this.setEndTimePM();
    			},

    			onPressClearDatesAndDurationForPMDialog: function(oEvent) {
    				this.notifData.firstFillField = undefined;
    				this.notifData.secondFillField = undefined;
    				sap.oee.ui.Utils
					.calculateStartAndEndDatesWithDuration(
							this.notifData,
							sap.ui.core.Fragment.byId("notifDialog","startDateforPMNotification"),
							sap.ui.core.Fragment.byId("notifDialog","startTimeforPMNotification"),
							sap.ui.core.Fragment.byId("notifDialog","endDateforPMNotification"),
							sap.ui.core.Fragment.byId("notifDialog","endTimeforPMNotification"),
							sap.ui.core.Fragment.byId("notifDialog","durationforPMNotification"),
							sap.ui.core.Fragment.byId("notifDialog","setCurrentForStartTimePM"),
							sap.ui.core.Fragment.byId("notifDialog","setCurrentForEndTimePM"),
							this.interfaces);

    				this.notifData.startTimeStamp = undefined;
    				this.notifData.endTimeStamp = undefined;

    				this.oNotifReportingModel.setProperty("/startDate", "");
    				this.oNotifReportingModel.setProperty("/endDate", "");
    				this.oNotifReportingModel.setProperty("/startTime", "");
    				this.oNotifReportingModel.setProperty("/endTime", "");
    				this.oNotifReportingModel.refresh();

    				this.oNotifDialog.rerender();

    			},

    			setDurationInMinsPM: function() {
    				var duration = sap.ui.core.Fragment.byId("notifDialog", "durationforPMNotification").getValue();
    				if (duration != undefined) {
    					this.notifData.duration = duration;
    					if (parseInt(duration) > 0) {
    						this.notifData.duration = duration;
    						if (this.notifData.firstFillField == undefined) {
    							this.notifData.firstFillField = "DURATION";
    						} else {
    							if (this.notifData.firstFillField != "DURATION") {
    								this.notifData.secondFillField = "DURATION";
    							}
    						}
    						sap.oee.ui.Utils
    						.calculateStartAndEndDatesWithDuration(
    								this.notifData,
    								sap.ui.core.Fragment.byId("notifDialog","startDateforPMNotification"),
    								sap.ui.core.Fragment.byId("notifDialog","startTimeforPMNotification"),
    								sap.ui.core.Fragment.byId("notifDialog","endDateforPMNotification"),
    								sap.ui.core.Fragment.byId("notifDialog","endTimeforPMNotification"),
    								sap.ui.core.Fragment.byId("notifDialog","durationforPMNotification"),
    								sap.ui.core.Fragment.byId("notifDialog","setCurrentForStartTimePM"),
    								sap.ui.core.Fragment.byId("notifDialog","setCurrentForEndTimePM"),
    								this.interfaces);
    					} else if (duration.length == 0) {
    						if (this.notifData.firstFillField == "DURATION") {
    							if (this.notifData.secondFillField != undefined) {
    								this.notifData.firstFillField = this.notifData.secondFillField;
    								this.notifData.secondFillField = undefined;
    							} else {
    								this.notifData.firstFillField = undefined;
    							}
    						}

    						if (this.notifData.secondFillField == "DURATION") {
    							this.notifData.secondFillField = undefined;
    						}

    						sap.oee.ui.Utils
    						.calculateStartAndEndDatesWithDuration(
    								this.notifData,
    								sap.ui.core.Fragment.byId("notifDialog","startDateforPMNotification"),
    								sap.ui.core.Fragment.byId("notifDialog","startTimeforPMNotification"),
    								sap.ui.core.Fragment.byId("notifDialog","endDateforPMNotification"),
    								sap.ui.core.Fragment.byId("notifDialog","endTimeforPMNotification"),
    								sap.ui.core.Fragment.byId("notifDialog","durationforPMNotification"),
    								sap.ui.core.Fragment.byId("notifDialog","setCurrentForStartTimePM"),
    								sap.ui.core.Fragment.byId("notifDialog","setCurrentForEndTimePM"),
    								this.interfaces);
    					}
    				}
    			},

    			getDateObjectFromUI : function(dateInput, timeInput){
    				var combinedDateTimeObject;
    				if(dateInput && timeInput && dateInput !="" && timeInput !=""){
    		    		combinedDateTimeObject =  sap.oee.ui.Utils.createTimestampFromDateTime(dateInput, timeInput);
    				}
    				return combinedDateTimeObject;
    			},
    			
    			setStartTimePM: function() {
    				var startDate = sap.ui.core.Fragment.byId("notifDialog", "startDateforPMNotification").getDateValue();	
    				var startTime = sap.ui.core.Fragment.byId("notifDialog", "startTimeforPMNotification").getDateValue();
    				var duration = sap.ui.core.Fragment.byId("notifDialog", "durationforPMNotification").getValue();
    				if(startDate && startTime && startDate !="" && startTime !=""){
    					if(duration!== undefined && duration!== null && duration !== ""){
    						this.notifData.startTimeStamp = sap.oee.ui.Utils.createTimestampFromDateTime(startDate, startTime).getTime();
    						this.notifData.firstFillField = "DURATION";
    					}
    					this.notifData.startTimeStamp = sap.oee.ui.Utils.createTimestampFromDateTime(startDate, startTime).getTime();
    					if (this.notifData.startTimeStamp != undefined) {
    						if (this.notifData.firstFillField == undefined) {
    							this.notifData.firstFillField = "START_TIME";
    						} else {
    							if (this.notifData.firstFillField != "START_TIME") {
    								this.notifData.secondFillField = "START_TIME";
    							}
    						}

    						sap.oee.ui.Utils.calculateStartAndEndDatesWithDuration(
    								this.notifData,
    								sap.ui.core.Fragment.byId("notifDialog", "startDateforPMNotification"),
    								sap.ui.core.Fragment.byId("notifDialog", "startTimeforPMNotification"),
    								sap.ui.core.Fragment.byId("notifDialog", "endDateforPMNotification"),
    								sap.ui.core.Fragment.byId("notifDialog", "endTimeforPMNotification"),
    								sap.ui.core.Fragment.byId("notifDialog", "durationforPMNotification"),
    								sap.ui.core.Fragment.byId("notifDialog", "setCurrentForStartTimePM"),
    								sap.ui.core.Fragment.byId("notifDialog", "setCurrentForEndTimePM"),
    								this.interfaces);
    					}
    				} else {
    					if (this.notifData.firstFillField == "START_TIME") {
    						if (this.notifData.secondFillField != undefined) {
    							this.notifData.firstFillField = this.notifData.secondFillField;
    							this.notifData.secondFillField = undefined;
    						} else {
    							this.notifData.firstFillField = undefined;
    						}
    					}

    					if (this.notifData.secondFillField == "START_TIME") {
    						this.notifData.secondFillField = undefined;
    					}

    					sap.oee.ui.Utils.calculateStartAndEndDatesWithDuration(
    							this.notifData,
    							sap.ui.core.Fragment.byId("notifDialog", "startDateforPMNotification"),
    							sap.ui.core.Fragment.byId("notifDialog", "startTimeforPMNotification"),
    							sap.ui.core.Fragment.byId("notifDialog", "endDateforPMNotification"),
    							sap.ui.core.Fragment.byId("notifDialog", "endTimeforPMNotification"),
    							sap.ui.core.Fragment.byId("notifDialog", "durationforPMNotification"),
    							sap.ui.core.Fragment.byId("notifDialog", "setCurrentForStartTimePM"),
    							sap.ui.core.Fragment.byId("notifDialog", "setCurrentForEndTimePM"),
    							this.interfaces);
    				}
    			},

    			setEndTimePM: function() {	
    				var startDate = sap.ui.core.Fragment.byId("notifDialog", "startDateforPMNotification").getDateValue();		
    				var startTime = sap.ui.core.Fragment.byId("notifDialog", "startTimeforPMNotification").getDateValue();
    				var endDate = sap.ui.core.Fragment.byId("notifDialog", "endDateforPMNotification").getDateValue();
    				var endTime = sap.ui.core.Fragment.byId("notifDialog", "endTimeforPMNotification").getDateValue();
    				if(startDate && startTime && startDate !="" && startTime !=""){
    					this.notifData.startTimeStamp = sap.oee.ui.Utils.createTimestampFromDateTime(startDate, startTime).getTime();
    					this.notifData.firstFillField = "START_TIME";
    				}
    				if (endTime != undefined) {
    					this.notifData.endTimeStamp = sap.oee.ui.Utils.createTimestampFromDateTime(endDate, endTime).getTime();
    					if (this.notifData.endTimeStamp != undefined) {
    						if (this.notifData.firstFillField == undefined) {
    							this.notifData.firstFillField = "END_TIME";
    						} else {
    							if (this.notifData.firstFillField != "END_TIME") {
    								this.notifData.secondFillField = "END_TIME";
    							}
    						}
    						sap.oee.ui.Utils.calculateStartAndEndDatesWithDuration(
    								this.notifData,
    								sap.ui.core.Fragment.byId("notifDialog", "startDateforPMNotification"),
    								sap.ui.core.Fragment.byId("notifDialog", "startTimeforPMNotification"),
    								sap.ui.core.Fragment.byId("notifDialog", "endDateforPMNotification"),
    								sap.ui.core.Fragment.byId("notifDialog", "endTimeforPMNotification"),
    								sap.ui.core.Fragment.byId("notifDialog", "durationforPMNotification"),
    								sap.ui.core.Fragment.byId("notifDialog", "setCurrentForStartTimePM"),
    								sap.ui.core.Fragment.byId("notifDialog", "setCurrentForEndTimePM"),
    								this.interfaces);
    					}
    				} else {
    					if (this.notifData.firstFillField == "END_TIME") {
    						if (this.notifData.secondFillField != undefined) {
    							this.notifData.firstFillField = this.notifData.secondFillField;
    							this.notifData.secondFillField = undefined;
    						} else {
    							this.notifData.firstFillField = undefined;
    						}
    					}

    					if (this.notifData.secondFillField == "END_TIME") {
    						this.notifData.secondFillField = undefined;
    					}

    					sap.oee.ui.Utils.calculateStartAndEndDatesWithDuration(
    							this.notifData,
    							sap.ui.core.Fragment.byId("notifDialog", "startDateforPMNotification"),
    							sap.ui.core.Fragment.byId("notifDialog", "startTimeforPMNotification"),
    							sap.ui.core.Fragment.byId("notifDialog", "endDateforPMNotification"),
    							sap.ui.core.Fragment.byId("notifDialog", "endTimeforPMNotification"),
    							sap.ui.core.Fragment.byId("notifDialog", "durationforPMNotification"),
    							sap.ui.core.Fragment.byId("notifDialog", "setCurrentForStartTimePM"),
    							sap.ui.core.Fragment.byId("notifDialog", "setCurrentForEndTimePM"),
    							this.interfaces);
    				}
    			},

    			checkStartDateTimeInputsPM : function(oEvent){
    		    	var startDate, startTime;
    		    	startDate = sap.ui.core.Fragment.byId("notifDialog", "startDateforPMNotification").getDateValue();
    		    	startTime = sap.ui.core.Fragment.byId("notifDialog", "startTimeforPMNotification").getValue(); 
    		    	if(startDate && startTime && startDate !="" && startTime !=""){
    		    		this.setStartTimePM();
    		    	}
    		    },
    		    
    		    checkEndDateTimeInputsPM : function(oEvent){
    		    	var endDate, endTime;
    		    	endDate = sap.ui.core.Fragment.byId("notifDialog", "endDateforPMNotification").getDateValue();
    		    	endTime = sap.ui.core.Fragment.byId("notifDialog", "endTimeforPMNotification").getValue(); 
    		    	if(endDate && endTime && endDate !="" && endTime !=""){
    		    		this.setEndTimePM();
    		    	}
    		    },
    		    
    			handleOkForPMDialog: function() {
    				var combinedStartDate,combinedEndDate;
    				var currentTimeStamp = new Date();
    				if (this.notifData !== undefined) {
    					if (this.notifData.nodeDesc !== undefined) {            			
    						var startDate = sap.ui.core.Fragment.byId("notifDialog", "startDateforPMNotification").getDateValue();
    						var startTime = sap.ui.core.Fragment.byId("notifDialog", "startTimeforPMNotification").getDateValue();
    						if(startDate && startTime && startDate !="" && startTime !=""){
    							combinedStartDate = sap.oee.ui.Utils.createTimestampFromDateTime(startDate, startTime);
    							if (combinedStartDate.getTime() > currentTimeStamp) {
    								sap.oee.ui.Utils.createMessage(this.appComponent.oBundle.getText("OEE_LABEL_STARTTIME_FUTURE"),sap.ui.core.MessageType.Error);
    								return;
    							}
    							var endDate = sap.ui.core.Fragment.byId("notifDialog", "endDateforPMNotification").getDateValue();
    							var endTime = sap.ui.core.Fragment.byId("notifDialog", "endTimeforPMNotification").getDateValue();
    							if(endDate && endTime && endDate !="" && endTime !=""){
    								combinedEndDate = sap.oee.ui.Utils.createTimestampFromDateTime(endDate, endTime);
    								if (combinedEndDate.getTime() > currentTimeStamp) {
    									sap.oee.ui.Utils.createMessage(this.appComponent.oBundle.getText("OEE_LABEL_ENDTIME_FUTURE"),sap.ui.core.MessageType.Error);
    									return;
    								}
    								if (combinedEndDate.getTime() <= combinedStartDate.getTime()) {
    									sap.oee.ui.Utils.createMessage(this.appComponent.oBundle.getText("START_TIME_GREATER_THAN_END_TIME_ERROR"),sap.ui.core.MessageType.Error);
    									return;
    								}
    								this.notifData.endTimeStamp = sap.oee.ui.Utils.removePlantTimezoneTimeOffsetAndSendUTC(combinedEndDate.getTime(), this.appData.plantTimezoneOffset);	
    							}
    							this.notifData.startTimeStamp = sap.oee.ui.Utils.removePlantTimezoneTimeOffsetAndSendUTC(combinedStartDate.getTime(), this.appData.plantTimezoneOffset);
    							var duration = sap.ui.core.Fragment.byId("notifDialog","durationforPMNotification").getValue();
    							var comments = sap.ui.core.Fragment.byId("notifDialog","commentsForPMNotification").getValue();
    							var breakdown = sap.ui.core.Fragment.byId("notifDialog","breakDownForPMNotification").getSelected();
    							if (comments !== undefined && comments !== "") {
    								this.notifData.comments = comments;
    							}
    							if (breakdown !== undefined) {
    								this.notifData.breakdown = breakdown;
    							}

    							if(this.reportNotificationMode === "UPDATE" && this.selectedPMNotification.notificationNo !== ""){
    								this.notifData.notificationType = this.selectedPMNotification.notificationType;	
    								sap.ui.core.Fragment.byId("notifDialog","SinglePMNotificationType").setVisible(true);
    								sap.ui.core.Fragment.byId("notifDialog","MultiPMNotificationType").setVisible(false);
    							}
    							else{
    								if (this.notificationType && this.notificationType.length > 0 ) {
    									if (this.notificationType.length === 1) {
    										sap.ui.core.Fragment.byId("notifDialog", "SinglePMNotificationType").setVisible(true);
    										sap.ui.core.Fragment.byId("notifDialog", "MultiPMNotificationType").setVisible(false);
    										this.notifData.notificationType = this.notificationType[0].value;
    									} else {
    										sap.ui.core.Fragment.byId("notifDialog", "SinglePMNotificationType").setVisible(false);
    										sap.ui.core.Fragment.byId("notifDialog", "MultiPMNotificationType").setVisible(true);
    										var changeNotificationType = sap.ui.core.Fragment.byId("notifDialog", "MultiValue").getSelectedKey();
    										if(this.reportNotificationMode === "UPDATE"){
    											sap.ui.core.Fragment.byId("notifDialog", "MultiValue").setSelectedKey(changeNotificationType);
    										}
    										else{
    											sap.ui.core.Fragment.byId("notifDialog", "MultiValue").setSelectedKey(this.notificationType[0].value);
    										}
    										this.notifData.notificationType = changeNotificationType;

    									}
    								}
    							}

    							var results = undefined;
    							if (this.notifData && this.notifData.nodeID) {
    								var notifDataTemp = {};
    								notifDataTemp.plant = this.appData.plant;
    								notifDataTemp.client = this.appData.client;
    								notifDataTemp.nodeID = this.notifData.nodeID;
    								notifDataTemp.startTimeStamp = this.notifData.startTimeStamp;
    								notifDataTemp.notificationType = this.notifData.notificationType;
    								if (this.notifData.endTimeStamp) {
    									notifDataTemp.endTimeStamp = this.notifData.endTimeStamp;
    								}
    								notifDataTemp.technicalObject = {
    										client: notifDataTemp.client,
    										plant: notifDataTemp.plant,
    										nodeID: notifDataTemp.nodeID,
    										flocID: this.notifData.fLocation,
    										equipmentID: this.notifData.equipment

    								};

    								notifDataTemp.comments = this.notifData.comments;
    								notifDataTemp.actsAsBreakdown = this.notifData.breakdown;  
    								notifDataTemp.comments = this.notifData.comments;



    								//Check Mode 
    								if (this.reportNotificationMode == "UPDATE") {
    									results = this.interfaces.updatePMNotificationDetails(notifDataTemp.client,notifDataTemp.plant,notifDataTemp.nodeID,notifDataTemp.startTimeStamp,
    											notifDataTemp.endTimeStamp,notifDataTemp.technicalObject,notifDataTemp.notificationType,
    											notifDataTemp.actsAsBreakdown,notifDataTemp.comments,this.selectedPMNotification.oeeNotificationID,
    											this.selectedPMNotification.notificationNo,this.selectedPMNotification.oeeStatus,false,null);

    									if (results.oeeNotificationID) {
    										sap.oee.ui.Utils.toast(this.appComponent.oBundle.getText("OEE_MESSAGE_SUCCESSFUL_SAVE"));
    										this.oNotifDialog.close();

    										this.onRefresh();
    									} else {
    										sap.oee.ui.Utils.createMessage(results.outputMessage,sap.ui.core.MessageType.Error);
    									}
    								}
    								else if (this.reportNotificationMode == "NEW") {
    									results = this.interfaces.createPMNotification(notifDataTemp.client,notifDataTemp.plant,notifDataTemp.nodeID,notifDataTemp.startTimeStamp,
    											notifDataTemp.endTimeStamp,notifDataTemp.technicalObject,notifDataTemp.notificationType,
    											notifDataTemp.actsAsBreakdown,notifDataTemp.comments);

    									if (results.oeeNotificationID) {
    										sap.oee.ui.Utils.toast(this.appComponent.oBundle.getText("OEE_MESSAGE_SUCCESSFUL_SAVE"));
    										this.oNotifDialog.close();
    										this.initializeNotif();
    										this.onRefresh();
    									} else {
    										sap.oee.ui.Utils.createMessage(results.outputMessage,sap.ui.core.MessageType.Error);
    									}

    								}
    							}
    						} else {
    							sap.oee.ui.Utils.createMessage(this.appComponent.oBundle.getText("OEE_ERR_MSG_ENTER_START_TIME"),sap.ui.core.MessageType.Error);
    							return;
    						}
    					} else {
    						sap.oee.ui.Utils.createMessage(this.appComponent.oBundle.getText("OEE_ERR_MSG_SELECT_WC"),sap.ui.core.MessageType.Error);
    						return;
    					}
    				}
    			},

    			_mapPMNotificationStatus: function(notification) {
    				for (var i = 0; i < notification.length; i++) {
    					for (var keys in notification[i]) {
    						if (keys === "oeeStatus") {
    							notification[i].statusDesc = this.status[notification[i][keys]];
    						}
    					}
    				}
    				return notification;
    			},

    			checkComments: function(oEvent) {
    				var comments = sap.ui.core.Fragment.byId("notifDialog","commentsForPMNotification").getValue();
    				if (comments.length > 40) {   
    					sap.oee.ui.Utils.createMessage(this.appComponent.oBundle.getText("OEE_COMMENTS_LENGTH"), sap.ui.core.MessageType.Error); 
    					return;
    				}
    			},

    			onSelectNotification: function(oEvent) {
    				this.selectedPMNotification = oEvent.getParameter(
    						"listItem").getBindingContext().getObject();
    				this.getView().byId("rejectButtonNotification").setEnabled(false);   
    				this.getView().byId("approveButtonNotification").setEnabled(false);
    				this.getView().byId("deleteButtonNotification").setEnabled(false);
    				this.getView().byId("syncButtonNotification").setEnabled(false);
    				this.getView().byId("updateButtonNotification").setEnabled(false);
    				if (this.selectedPMNotification.oeeStatus === 'NEW' || (this.selectedPMNotification.oeeStatus === 'UPD'&& this.selectedPMNotification.notificationNo === "") ){
    					this.getView().byId("approveButtonNotification").setEnabled(true);
    					this.getView().byId("rejectButtonNotification").setEnabled(true);
    					this.getView().byId("updateButtonNotification").setEnabled(true);
    				}
    				if (this.selectedPMNotification.oeeStatus === 'UPD' && this.selectedPMNotification.notificationNo != "") { 
    					this.getView().byId("approveButtonNotification").setEnabled(true);
    					this.getView().byId("updateButtonNotification").setEnabled(true);
    				} 
    				if (this.selectedPMNotification.oeeStatus === 'E_F') { 
    					this.getView().byId("updateButtonNotification").setEnabled(true);
    				} 
    				if (this.selectedPMNotification.oeeStatus === 'E_F' && this.selectedPMNotification.notificationNo === ""){
    					this.getView().byId("rejectButtonNotification").setEnabled(true);
    				}
    				if (this.selectedPMNotification.oeeStatus === 'REJ') {
    					this.getView().byId("deleteButtonNotification").setEnabled(true);
    				} 
    				if (this.selectedPMNotification.oeeStatus === 'E_C'  ) {
    					this.getView().byId("updateButtonNotification").setEnabled(true);
    					this.getView().byId("syncButtonNotification").setEnabled(true);
    				} 
    				if (this.selectedPMNotification.oeeStatus === 'E_U'  ) {
    					this.getView().byId("updateButtonNotification").setEnabled(true);
    					this.getView().byId("syncButtonNotification").setEnabled(true);
    				} 

    			},

    			onApproveNotification: function() {
    				this.interfaces.triggerPMNotification(this.selectedPMNotification.oeeNotificationID);
    				this.getView().byId("notifTable").removeSelections();
    				this.onRefresh();
    				this.getView().byId("rejectButtonNotification").setEnabled(false);
    				this.getView().byId("approveButtonNotification").setEnabled(false);
    				this.getView().byId("updateButtonNotification").setEnabled(false);
    				sap.oee.ui.Utils.toast(this.appComponent.oBundle.getText("OEE_MESSAGE_TRIGGER_NOTIFICATION"));
    			},

    			onRejectNotification: function() {
    				var that = this;
    				sap.m.MessageBox.show(this.appComponent.oBundle.getText("OEE_MSG_CHECK_REJECT"), {
    					icon: sap.m.MessageBox.Icon.WARNING,
    					title: this.appComponent.oBundle.getText("OEE_LABEL_CONFIRM_REJECTION"),
    					actions: [ sap.m.MessageBox.Action.YES,sap.m.MessageBox.Action.NO],
    					onClose: function(oAction) {
    						if (oAction === sap.m.MessageBox.Action.YES) {
    							that.interfaces.rejectPMNotification(that.selectedPMNotification.oeeNotificationID);
    							sap.oee.ui.Utils.toast(that.appComponent.oBundle.getText("OEE_MESSAGE_REJECT_NOTIFICATION"));
    						}
    						that.getView().byId("notifTable").removeSelections();
    						that.onRefresh();
    						that.getView().byId("rejectButtonNotification").setEnabled(false);
    						that.getView().byId("approveButtonNotification").setEnabled(false);
    						that.getView().byId("updateButtonNotification").setEnabled(false);
    					}
    				});
    			},

    			onDeleteNotification: function() {
    				this.interfaces.deletePMNotification(this.selectedPMNotification.oeeNotificationID);
    				this.getView().byId("notifTable").removeSelections();
    				this.onRefresh();
    				this.getView().byId("deleteButtonNotification").setEnabled(false);
    				sap.oee.ui.Utils.toast(this.appComponent.oBundle.getText("OEE_MESSAGE_DELETE_NOTIFICATION"));
    			},

    			onOpenfilter: function(oEvent){
    				this._oListData = [{Name:this.appComponent.oBundle.getText('OEE_LABEL_STATUSH')},
    				                   {Name:this.appComponent.oBundle.getText('OEE_LABEL_DURATION_MINS')}];
    				if(!this.filterListModel){
    					this.filterListModel = new sap.ui.model.json.JSONModel();
    				}
    				this.filterListModel.setData({filterList:this._oListData});
    				sap.ui.core.Fragment.byId("PMNotificationFilter","filterlist").setModel(this.filterListModel);
    				this.ofilterDialog.open();
    			},

    			onNavToDetail: function(oEvent){
    				var oFilter = oEvent.getSource().getTitle();
    				var oNavContainer = sap.ui.core.Fragment.byId("PMNotificationFilter","navContainer");
    				var oDetailPage;
    				if(oFilter!== undefined && oFilter !== null){
    					if(oFilter === this.appComponent.oBundle.getText('OEE_LABEL_STATUSH')){
    						oDetailPage = sap.ui.core.Fragment.byId("PMNotificationFilter","detailStatus");
    						sap.ui.core.Fragment.byId("PMNotificationFilter","reset-time").setVisible(false);
    					}
    					else if(oFilter === this.appComponent.oBundle.getText('OEE_LABEL_DURATION_MINS')){
    						oDetailPage = sap.ui.core.Fragment.byId("PMNotificationFilter","detailDuration");
    						sap.ui.core.Fragment.byId("PMNotificationFilter","reset-time").setVisible(true);
    					}
    					oNavContainer.to(oDetailPage);
    				}
    			},	


    			handleMasterSearch: function(oEvent){
    				var properties = [];
    				properties.push("Name");
    				var oList = sap.ui.core.Fragment.byId("PMNotificationFilter","filterlist");
    				sap.oee.ui.Utils.fuzzySearch(this, this.filterListModel,oEvent.getSource().getValue(), oList.getBinding("items"), oEvent.getSource(), properties);
    			},

    			handleStatusSearch: function(oEvent){
    				var properties = [];
    				properties.push("value");
    				var oList = sap.ui.core.Fragment.byId("PMNotificationFilter","filterStatus");
    				sap.oee.ui.Utils.fuzzySearch(this, this.statusModel,oEvent.getSource().getValue(), oList.getBinding("items"), oEvent.getSource(), properties);
    			},

    			prepareFilterModel: function() {
    				if(!this.ofilterDialog){
    					this.ofilterDialog = sap.ui.xmlfragment("PMNotificationFilter","sap.oee.ui.fragments.PMNotificationFilter",this);
    				}
    				this.getView().addDependent(this.ofilterDialog);
    				var filterStatus = [
    				                    {"value": this.appComponent.oBundle.getText('OEE_LABEL_STATUS_NEW')}, 
    				                    {"value": this.appComponent.oBundle.getText('OEE_LABEL_STATUS_EC')},
    				                    {"value": this.appComponent.oBundle.getText('OEE_LABEL_STATUS_EF')},
    				                    {"value": this.appComponent.oBundle.getText('OEE_LABEL_STATUS_REJ')},
    				                    {"value": this.appComponent.oBundle.getText('OEE_LABEL_STATUS_EU')}

    				                    ];
    				if (!this.statusModel) {
    					this.statusModel = new sap.ui.model.json.JSONModel();
    				}
    				this.statusModel.setData({
    					status: filterStatus
    				});
    				sap.ui.core.Fragment.byId("PMNotificationFilter","filterStatus").setModel(this.statusModel);
    				if (!this.durationModel) {
    					this.durationModel = new sap.ui.model.json.JSONModel();
    				}
    				sap.ui.core.Fragment.byId("PMNotificationFilter","detailDuration").setModel(this.durationModel);

    			},

    			onNavBack: function(){
    				var oNavContainer = sap.ui.core.Fragment.byId("PMNotificationFilter","navContainer");
    				oNavContainer.back();
    			},

    			onCloseFilter: function(oEvent){
    				// status filter
    				var combinedStartDate, combinedEndDate;
    				var selectedItem = sap.ui.core.Fragment.byId("PMNotificationFilter","filterStatus").getSelectedItems();
    				var oNavContainer = sap.ui.core.Fragment.byId("PMNotificationFilter","navContainer");
    				this.statusSelectedKeyFilter = [];
    				if (selectedItem.length > 0) {
    					for (var i=0;i<selectedItem.length;i++) {
    						for (var key in this.status) {
    							if (selectedItem[i].getContent()[0].getText() === this.status[key]) {
    								this.statusSelectedKeyFilter.push({
    									client: this.appData.client,
    									oeeStatus: key
    								});
    							}
    						}
    					}
    					this.getView().byId('filter').setType("Accept");
    				}

    				// duration filter

    	        	var startDate = sap.ui.core.Fragment.byId("PMNotificationFilter", "startDate").getDateValue();
    	            var startTime = sap.ui.core.Fragment.byId("PMNotificationFilter", "startTime").getDateValue();
    	            if(startDate && startTime && startDate !="" && startTime !=""){
    	            	var endDate = sap.ui.core.Fragment.byId("PMNotificationFilter", "endDate").getDateValue();
    	                var endTime = sap.ui.core.Fragment.byId("PMNotificationFilter", "endTime").getDateValue();
    	                if(endDate && endTime && endDate !="" && endTime !=""){
    	                	combinedStartDate = sap.oee.ui.Utils.createTimestampFromDateTime(startDate, startTime);
    	                	combinedEndDate = sap.oee.ui.Utils.createTimestampFromDateTime(endDate, endTime);
    	                }
    	            }
    	                	
    				this.startTimefilter = null;
    				this.endTimefilter = null;
    				var durationFilter;
    				if (combinedStartDate !== undefined && combinedStartDate!==null) {
    					this.combinedStartDatefilter = combinedStartDate.getTime();
    					if (combinedEndDate !== undefined && combinedEndDate !== null) {
    						if (combinedEndDate < combinedStartDate) {
    							sap.oee.ui.Utils.createMessage(this.appComponent.oBundle.getText("START_TIME_GREATER_THAN_END_TIME_ERROR"),sap.ui.core.MessageType.Error);
    							return;
    						} else if (combinedEndDate.getTime() == combinedStartDate.getTime()) {
    							sap.oee.ui.Utils.createMessage(this.appComponent.oBundle.getText("START_TIME_EQUALS_END_TIME_ERROR"),sap.ui.core.MessageType.Error);
    							return;
    						}
    						this.endTimefilter = combinedEndDate.getTime();
    						this.startTimefilter = combinedStartDate.getTime();
    					}
    					this.getView().byId('filter').setType("Accept");
    					durationFilter = 'X';
    				}
    				if(endTime!==null && combinedStartDate=== null){
    					sap.oee.ui.Utils.createMessage(this.appComponent.oBundle.getText("OEE_ERR_MSG_ENTER_START_TIME"),sap.ui.core.MessageType.Error);
    					return;
    				}
    				// check whether filter has been applied
    				if(selectedItem.length===0 && durationFilter!=='X'){
    					this.getView().byId('filter').setType("Default");
    				}

    				this.onRefresh();
    				oNavContainer.back();
    				this.ofilterDialog.close();
    			},

    			onSelectAll: function(){
    				sap.ui.core.Fragment.byId("PMNotificationFilter","filterStatus").removeSelections();
    			},

    			onSelectItem: function(){
    				sap.ui.core.Fragment.byId("PMNotificationFilter","checkAll").setSelected(false);
    			},

    			onResetDurationFilter: function(oEvent){
    				this.durationModel.setProperty("/startTime","");
    				this.durationModel.setProperty("/endTime","");
    				this.durationModel.setProperty("/endDate","");
    				this.durationModel.setProperty("/startDate","");
    				this.durationModel.refresh();
    				this.ofilterDialog.rerender();
    			},

    			setCurrentStartTimeStamp: function() {
    				var dateObject;
    				var currentTimeStamp = this.interfaces.interfacesGetTimeInMsAfterTimezoneAdjustmentsForTimeStamp(new Date().getTime());

    				dateObject = new Date(currentTimeStamp);
    				this.durationModel.setProperty("/startDate", dateObject);
    				this.durationModel.setProperty("/startTime", dateObject);
    				this.durationModel.refresh();},

    				setCurrentEndTimeStamp: function() {
    					var dateObject;
    					var currentTimeStamp = this.interfaces.interfacesGetTimeInMsAfterTimezoneAdjustmentsForTimeStamp(new Date().getTime());

    					dateObject = new Date(currentTimeStamp);
    					this.durationModel.setProperty("/endDate", dateObject);
    					this.durationModel.setProperty("/endTime", dateObject);
    					this.durationModel.refresh();
    				},

    				// formatter for notification UI

    				formatTechnicalObject: function(floc, eq) {
    					var tObj;
    					if (floc !== "" && floc !== undefined) {
    						if (eq !== "" && eq !== undefined) {
    							eq = eq.replace(/^0+/g, "");
    							tObj = "\n" + this.appComponent.oBundle
    							.getText("OEE_LABEL_FLOC") + ": " + floc + "\n\n" + this.appComponent.oBundle
    							.getText("OEE_LABEL_EQUIPMENT") + " : " + eq;
    						} else {
    							tObj = "\n" + this.appComponent.oBundle
    							.getText("OEE_LABEL_FLOC") + " : " + floc;
    						}
    					} else {
    						if (eq !== "" && eq !== undefined) {
    							eq = eq.replace(/^0+/g, "");
    							tObj = "\n" + this.appComponent.oBundle
    							.getText("OEE_LABEL_EQUIPMENT") + " : " + eq;
    						}
    					}
    					return tObj;
    				},

    				onUpdateNotification : function(oEvent){

    					this.reportNotificationMode = "UPDATE" ;
    					this.byId("notifTable").removeSelections();
    					this.byId("updateButtonNotification").setEnabled(false);
    					this.byId("approveButtonNotification").setEnabled(false);
    					this.byId("rejectButtonNotification").setEnabled(false);
    					this.byId("syncButtonNotification").setEnabled(false);
    					this.techObjData = []; //
    					for (var i = 0; i < this.selectedWU.technicalObject.length; i++) {
    						if (this.selectedWU.technicalObject[i].equipment !== "" || this.selectedWU.technicalObject[i].fLoc !== "") {
    							this.techObjData.push(this.selectedWU.technicalObject[i]);
    						}
    					}
    					if (this.techObjData !== undefined) {
    						this.techModel = new sap.ui.model.json.JSONModel();
    						this.techModel.setData({techObjData: this.techObjData});
    						this.oTechObj.setModel(this.techModel);
    						var oBindingInfo = {};
    						oBindingInfo.path = "/techObjData";
    						oBindingInfo.factory = jQuery.proxy(function(sId, oContext) {
    							var oFL = oContext.getProperty('fLoc');
    							var oEquip = oContext.getProperty('equipment');
    							var oTemplate = new sap.m.ColumnListItem({cells: [
    							                                                  new sap.m.Text({text: "{fLoc}"}),
    							                                                  new sap.m.Text({text: "{path :'equipment', formatter:'sap.oee.ui.Formatter.formatRemoveLeadingZero'}"})
    							                                                  ],
    							                                                  type: "Active",
    							                                                  press: [this.handleOKForFLDialog,this]
    							});

    							return oTemplate;
    						}, this);
    						this.oTechObj.bindAggregation('items', oBindingInfo);
    					}

    					this.notifData.startDate = new Date(this.interfaces.interfacesGetTimeInMsAfterTimezoneAdjustmentsForTimeStamp(parseFloat(this.selectedPMNotification.startTimestamp)));
    					this.notifData.endDate = new Date(this.interfaces.interfacesGetTimeInMsAfterTimezoneAdjustmentsForTimeStamp(parseFloat(this.selectedPMNotification.endTimestamp)));
    					this.notifData.startTime = this.notifData.startDate;
    					this.notifData.endTime = this.notifData.endDate;

    					if (this.oNotifDialog == undefined) {
    						this.oNotifDialog = sap.ui.xmlfragment("notifDialog","customActivity.view.fragments.PMNotificationDialog",this);
    						this.byId(sap.ui.core.Fragment.createId("notifDialog","startTimeforPMNotification"));
    						this.byId(sap.ui.core.Fragment.createId("notifDialog", "endTimeforPMNotification"));
    						this.byId(sap.ui.core.Fragment.createId( "notifDialog","durationforPMNotification"));
    						this.byId(sap.ui.core.Fragment.createId("notifDialog","commentsForPMNotification"));
							this.byId(sap.ui.core.Fragment.createId("notifDialog","breakDownForPMNotification"));
							this.byId(sap.ui.core.Fragment.createId("notifDialog","reasonCodeCombo"));
    						this.byId(sap.ui.core.Fragment.createId("notifDialog","pmWorkCenterCombo"));


    						this.getView().addDependent(this.oNotifDialog);
    					} else {
    						sap.ui.core.Fragment.byId("notifDialog","startTimeforPMNotification").setEnabled(true);
    						sap.ui.core.Fragment.byId("notifDialog","endTimeforPMNotification").setEnabled(true);
    						sap.ui.core.Fragment.byId("notifDialog","durationforPMNotification").setEnabled(true);
    						sap.ui.core.Fragment.byId("notifDialog","setCurrentForStartTimePM").setEnabled(true);
    						sap.ui.core.Fragment.byId("notifDialog","setCurrentForEndTimePM").setEnabled(true);
    					}
    					if (!this.oNotifReportingModel) {
    						this.oNotifReportingModel = new sap.ui.model.json.JSONModel();
    					}
    					this.notifData.nodeDesc = this.selectedWU.description;
    					this.notifData.nodeID = this.selectedWU.nodeID;
    					this.notifData.fLocation = this.selectedPMNotification.flocID;
    					this.notifData.equipment = this.selectedPMNotification.equipmentID;


    					if(this.selectedPMNotification.startTimestamp === ""){
    						this.notifData.startTimeStamp = 0;
    					}else{
    						this.notifData.startTimeStamp = parseFloat(this.selectedPMNotification.startTimestamp);
    					}
    					if(this.selectedPMNotification.endTimestamp === ""){
    						this.notifData.endTimeStamp = 0;
    					}else{
    						this.notifData.endTimeStamp = parseFloat(this.selectedPMNotification.endTimestamp);
    					}

    					if (this.notifData.startTimeStamp != "" && this.notifData.endTimeStamp != "") {
    						var duratn = this.notifData.endTimeStamp - this.notifData.startTimeStamp;
    						var duration = parseInt(duratn / (1000 * 60));  
    						this.notifData.duration = duration;
    					} else {
    						this.notifData.duration = null;
    					}

    					this.notifData.comments = this.selectedPMNotification.comments;
    					this.notifData.actsAsBreakdown = this.selectedPMNotification.breakdown ;
    					var check_notifType = this.checkNotifType(this.appData.client, this.appData.plant,this.selectedWU.nodeID);
    					if (check_notifType.outputCode !== 1) {
    						if (check_notifType.customizationValues.results.length > 0) {
    							this.notificationType = check_notifType.customizationValues.results;
    						}
    					}
    					this.notifData.firstFillField = "START_TIME";
    					this.notificationTypeValue();	

    					this.oNotifReportingModel.setData({
    						notificationDataForModel: this.notifData
    					});

    					this.oNotifReportingModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
    					this.oNotifReportingModel.setProperty("/startDate",this.notifData.startDate);
    					this.oNotifReportingModel.setProperty("/endDate", this.notifData.endDate);
    					this.oNotifReportingModel.setProperty("/startTime",this.notifData.startTime);
    					this.oNotifReportingModel.setProperty("/endTime", this.notifData.endTime);
    					this.oNotifDialog.setModel(this.oNotifReportingModel);
    					this.oNotifDialog.setTitle(this.appComponent.oBundle.getText("OEE_LABEL_UPDATE_NOTIFICATION"));
    					this.oNotifDialog.open();

    				},

    				_busyIndicator: function(){
    					var busyIndicator = new sap.m.BusyDialog();
    					return busyIndicator;
    				},

    				onSyncNotification : function(){
    					var busyIndicator = this._busyIndicator();
    					this.getView().byId("notifTable").removeSelections();
    					this.getView().addDependent(busyIndicator);
    					jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), busyIndicator);
    					busyIndicator.open();
    					var inputXML = "<?xml version='1.0' encoding='UTF-8'?><BAPI_ALM_NOTIF_GET_DETAIL Description=''><INPUT><NUMBER>"+this.selectedPMNotification.notificationNo+"</NUMBER></INPUT></BAPI_ALM_NOTIF_GET_DETAIL>";
    					var nodeID = this.selectedPMNotification.nodeID;
    					var notificationID = this.selectedPMNotification.oeeNotificationID;
    					var transactionPath = "SAPMPM/ERPShopFloorIntegration/PlantMaintenance/SyncPMNotification";
    					var url = "/XMII/Runner?Transaction="+transactionPath+"&LogType=Info&inputXML="+inputXML+"&client="+this.appData.client+"&plant="+this.appData.plant+"&nodeID="+nodeID+"&notificationID="+notificationID+"&OutputParameter=*&Content-Type=text/XML";
    					var that = this;
    					$.ajax({
    						type: 'GET',
    						url: url,
    						contentType : "text/XML", 
    						Accept : "text/XML",
    						cache: false,
    						async: true,
    						success: function(xmlDoc, textStatus, jqXHR){
    							if(jQuery(xmlDoc).find("message").text()){
    								busyIndicator.close();
    								sap.oee.ui.Utils.createMessage(jQuery(xmlDoc).find("message").text(),sap.ui.core.MessageType.Error);
    								return;
    							}
    							that.onRefresh();	
    							busyIndicator.close();
    							sap.oee.ui.Utils.toast(that.appComponent.oBundle.getText("OEE_MESSAGE_SYNC_NOTIFICATION"));
    						},
    						crossDomain : true,
    						error : function(data, textStatus, jqXHR){
    							busyIndicator.close();
    							sap.oee.ui.Utils.toast(this.appComponent.oBundle.getText("OEE_MESSAGE_SYNC_FAILED_NOTIFICATION"));	
    						}
    					}); 
    				},
    				
    				onExit : function(){
    					this.appComponent.getEventBus().unsubscribe(this.appComponent.getId(), "shiftChanged", this.onRefresh, this);
					},
					// getReasonCodes bince
					handleOKForFLDialog : function(oEvent){

						var callback = function () {
							var isReasonCodeSelectedFromPopUp = false; // Initially giving the value false to this variable
							if (oController.downtimeData != undefined) {
								if (oController.downtimeData.reasonCodeData != undefined) {
									// var type = sap.ui.core.Fragment.byId(
									// 	"Z_DowntimeDialog",
									// 	"typeforDowntime"
									// );
									// /*if (oController.downtimeData.reasonCodeData == "NOT SELECTED") { // skip assignment will revert dcelement selection
									// 													oController.downtimeData.dcElement = type.getSelectedKey();
									// 									} else {
									// 													type.setSelectedKey(oController.downtimeData.dcElement);
									// 									}*/
									// type.setSelectedKey(oController.downtimeData.dcElement);
									oController
										.getView()
										.getController()
										.handleOkForReasonCodeDialog(oEvent);
									isReasonCodeSelectedFromPopUp = true;
								}
	
								if (isReasonCodeSelectedFromPopUp === false) {
									if (oController.dataForReasonCode !== undefined) {
										oController.oDowntimeReportingModel.oData.downtimeDataForModel.reasonCodeData =
											oController.dataForReasonCode;
									}
								}
							}
						};
	
						this.downtimeDCElementList = this.interfaces.getDCElementsForDowntimes();
						// this.flowTimeDCElementList = this.interfaces.getDCElementsForFlowTime();
						// this.dcElementList = this.interfaces.getDCElementDetails(
						// 	dcElemList
						// );
						this.dcElementList=this.downtimeDCElementList;
						
						var tempButton = new sap.m.Button({
							visible: false,
						});

						this.downtimeData = {"duration":"0","reasonCodeData":{"reasonCode1":"","reasonCode2":"","reasonCode3":"","reasonCode4":"","reasonCode5":"","reasonCode6":"","reasonCode7":"","reasonCode8":"","reasonCode9":"","reasonCode10":""},"comments":"","actsAsBottleneck":false,"crewSize":"0.00","standardDuration":"","fromMaterial":"","toMaterial":"","appDataCrewSize":"T","orderAssign":"","microStoppages":false,"frequency":"","eventType":"UNSCD_DOWN","dcElement":"UNSCH_DOWN","nodeDataList":[{"nodeID":"005056B561911EEA9DFE3673372822C1","nodeDescription":"KONVERTER01","nodeType":"LINE","bottleNeck":false,"technicalObject":[{"flocID":"1000","equipmentID":""},{"flocID":"1001","equipmentID":""},{"flocID":"1002","equipmentID":""},{"flocID":"K","equipmentID":""},{"flocID":"KRD-HH-DYT-TZ1","equipmentID":"000000000010000015"}],"capacityID":"10000009","isCapacity":false}]};
						sap.oee.ui.rcUtility.createReasonCodeToolPopupWithDCElement(
							this,
							tempButton,
							this.appData.client,
							this.appData.plant,
							this.appData.node.nodeID,
							"UNSCH_DOWN",//this.downtimeData.dcElement,
							this.downtimeData,
							"reasonCodeData",
							undefined,
							this.dcElementList,
							callback,
							this.appData.node.description
						);
					},

					handleOkForReasonCodeDialog :function(oEvent){
					//	this.handleOkForReasonCodeDialog2();
						this.handleOKForFLDialog2(oEvent);
					

					},

					getAndBindDCElementToDowntimeType: function () {
						if (this.flowTimeDCElementList == undefined) {
							this.flowTimeDCElementList = this.interfaces.getDCElementsForFlowTime();
						}
						if (this.downtimeDCElementList == undefined) {
							this.downtimeDCElementList = this.interfaces.getDCElementsForDowntimes();
						}
						if (
							this.setSelectedMode == sap.oee.ui.oeeConstants.dtTypes.FLOWTIME
						) {
							this.dcElementList = this.flowTimeDCElementList;
							if (this.dcElementList.dataCollectionElements != undefined) {
								this.downtimeData.dcElement = this.dcElementList.dataCollectionElements.results[0].dcElement;
								this.downtimeData.eventType = this.dcElementList.dataCollectionElements.results[0].timeElementType;
							}
						} else if (
							this.setSelectedMode == sap.oee.ui.oeeConstants.dtTypes.OTHERS
						) {
							var allowedDCElementList = sap.oee.ui.Utils.getActivityOptionValues(
								this.getView().getViewData().viewOptions,
								"OTHER_REP_DCELEMS"
							);
	
							if (allowedDCElementList && allowedDCElementList.length > 0) {
								var dcElemList = [];
								var appData = this.appData;
								$.each(allowedDCElementList, function (index, obj) {
									dcElemList[index] = {
										client: appData.client,
										dcElement: allowedDCElementList[index].optionValue,
									};
								});
	
								this.dcElementList = this.interfaces.getDCElementDetails(
									dcElemList
								);
	
								if (this.dcElementList.dataCollectionElements != undefined) {
									this.downtimeData.dcElement = this.dcElementList.dataCollectionElements.results[0].dcElement;
									this.downtimeData.eventType = this.dcElementList.dataCollectionElements.results[0].timeElementType;
								}
							}
						} else {
							this.dcElementList = this.downtimeDCElementList;
						}
	
						if (this.dcElementList.dataCollectionElements != undefined) {
							var type = sap.ui.core.Fragment.byId(
								"Z_DowntimeDialog",
								"typeforDowntime"
							);
							if (type != undefined) {
								type.clearSelection();
								type.removeAllItems();
							}
	
							for (
								var i = 0;
								i < this.dcElementList.dataCollectionElements.results.length;
								i++
							) {
								//if(this.dcElementList.dataCollectionElements.results[i].dcElement !== sap.oee.ui.oeeConstants.dcElementType.changeover){
								if (
									this.dcElementList.dataCollectionElements.results[i]
										.timeElementType !==
									sap.oee.ui.oeeConstants.timeElementTypes.changeOver
								) {
									if (this.downtimeMode == "Edit") {
										type.setSelectedKey(this.downtimeData.dcElement);
									} else if (this.downtimeMode == "New") {
										if (
											this.dcElementList.dataCollectionElements.results[i]
												.defaultDataCollectionElement
										) {
											this.downtimeData.dcElement = this.dcElementList.dataCollectionElements.results[
												i
											].dcElement;
											this.downtimeData.eventType = this.dcElementList.dataCollectionElements.results[
												i
											].timeElementType;
											type.setSelectedKey(this.downtimeData.dcElement);
										}
									}
	
									type.addItem(
										new sap.ui.core.Item({
											text: this.dcElementList.dataCollectionElements.results[i]
												.description,
											key: this.dcElementList.dataCollectionElements.results[i]
												.dcElement,
										})
									);
								} else {
									//if(this.dcElementList.dataCollectionElements.results[i].dcElement === sap.oee.ui.oeeConstants.dcElementType.changeover){
									if (
										this.dcElementList.dataCollectionElements.results[i]
											.timeElementType ===
										sap.oee.ui.oeeConstants.timeElementTypes.changeOver
									) {
										if (
											sap.oee.ui.Utils.workUnitSelectedIsCapacityMachine(
												this.downtimeData
											) ||
											this.workUnitType === sap.oee.ui.oeeConstants.lineType ||
											this.setChangeOverType === "X"
										) {
											if (this.downtimeMode == "Edit") {
												type.setSelectedKey(this.downtimeData.dcElement);
											} else if (this.downtimeMode == "New") {
												if (
													this.dcElementList.dataCollectionElements.results[i]
														.defaultDataCollectionElement
												) {
													this.downtimeData.dcElement = this.dcElementList.dataCollectionElements.results[
														i
													].dcElement;
													this.downtimeData.eventType = this.dcElementList.dataCollectionElements.results[
														i
													].timeElementType;
													type.setSelectedKey(this.downtimeData.dcElement);
												}
											}
											type.addItem(
												new sap.ui.core.Item({
													text: this.dcElementList.dataCollectionElements.results[
														i
													].description,
													key: this.dcElementList.dataCollectionElements.results[
														i
													].dcElement,
												})
											);
										}
									}
								}
							}
						}
					},
					handleOkForReasonCodeDialog2: function () {
						var techObj1 = [];
						var actsAsBottleneckLabel = sap.ui.core.Fragment.byId(
							"Z_DowntimeDialog",
							"bottleneckForDowntimeLabel"
						);
						if (this.downtimeData.dcElement == undefined) {
							this.getAndBindDCElementToDowntimeType();
						} else {
							//add eventType for the corresponding dcElement
							for (
								var i = 0;
								i < this.dcElementList.dataCollectionElements.results.length;
								i++
							) {
								if (this.dcElementList.dataCollectionElements.results.length) {
									if (
										this.dcElementList.dataCollectionElements.results[i]
											.dcElement == this.downtimeData.dcElement
									) {
										this.downtimeData.eventType = this.dcElementList.dataCollectionElements.results[
											i
										].timeElementType;
									}
								}
							}
						}
						//Adding the current running order detail in the object.If no order is running orderAssign value will be empty
						if (
							this.appData.selected.order != undefined ||
							this.appData.selected.order != ""
						) {
							this.downtimeData.orderAssign = {
								orderNo: this.appData.selected.order.orderNo,
								operationNo: this.appData.selected.operationNo,
								runId: this.appData.selected.runID,
							};
						} else {
							this.downtimeData.orderAssign = "";
						}
						if (this.downtimeMode == "Edit") {
							this.downtimeData.firstFillField = "START_TIME";
	
							this.oDowntimeReportingModel = new sap.ui.model.json.JSONModel({
								downtimeDataForModel: this.downtimeData,
							});
							this.oDowntimeReportingModel.setDefaultBindingMode(
								sap.ui.model.BindingMode.TwoWay
							);
							this.oDowntimeReportingModel.setProperty(
								"/startTime",
								this.downtimeData.startTime
							);
							this.oDowntimeReportingModel.setProperty(
								"/endTime",
								this.downtimeData.endTime
							);
							this.oDowntimeReportingModel.setProperty(
								"/startDate",
								this.downtimeData.startDate
							);
							this.oDowntimeReportingModel.setProperty(
								"/endDate",
								this.downtimeData.endDate
							);
	
							this.oDowntimeDialog.setModel(this.oDowntimeReportingModel);
							this.oDowntimeDialog.setTitle(
								this.appComponent.oBundle.getText("OEE_LABEL_DOWNTIME_EDIT")
							);
						} else if (this.downtimeMode == "New") {
							//this.downtimeData.startTimeStamp = this.interfaces.interfacesGetTimeInMsAfterTimezoneAdjustmentsForTimeStamp(new Date().getTime());
							//this.downtimeData.firstFillField = "START_TIME";
							this.oDowntimeReportingModel = new sap.ui.model.json.JSONModel({
								downtimeDataForModel: this.downtimeData,
							});
							this.oDowntimeReportingModel.setDefaultBindingMode(
								sap.ui.model.BindingMode.TwoWay
							);
							//this.oDowntimeReportingModel.setProperty("/startTime", new Date(this.downtimeData.startTimeStamp));
	
							this.oDowntimeReportingModel.setProperty(
								"/startDate",
								new Date(
									this.interfaces.interfacesGetTimeInMsAfterTimezoneAdjustmentsForTimeStamp(
										this.appData.shift.startTimestamp
									)
								)
							);
							this.oDowntimeReportingModel.setProperty(
								"/endDate",
								new Date(
									this.interfaces.interfacesGetTimeInMsAfterTimezoneAdjustmentsForTimeStamp(
										this.appData.shift.startTimestamp
									)
								)
							);
	
							this.oDowntimeDialog.setModel(this.oDowntimeReportingModel);
							this.oDowntimeReportingModel.refresh();
							this.oDowntimeDialog.setTitle(
								this.appComponent.oBundle.getText("OEE_LABEL_REPORT_DOWNTIME")
							);
						}
	
						//
						if (
							sap.ui.core.Fragment.byId(
								"Z_DowntimeDialog",
								"checkPMNotification"
							).getSelected() == true
						) {
							sap.ui.core.Fragment.byId(
								"Z_DowntimeDialog",
								"functionalLocation"
							).setVisible(true);
							sap.ui.core.Fragment.byId(
								"Z_DowntimeDialog",
								"equipment"
							).setVisible(true);
							sap.ui.core.Fragment.byId(
								"Z_DowntimeDialog",
								"breakDown"
							).setVisible(true);
	
							if (this.notificationType && this.notificationType.length > 0) {
								if (this.notificationType.length === 1) {
									sap.ui.core.Fragment.byId(
										"Z_DowntimeDialog",
										"SinglePMNotificationType"
									).setVisible(true);
									sap.ui.core.Fragment.byId(
										"Z_DowntimeDialog",
										"MultiPMNotificationType"
									).setVisible(false);
									this.PMNotification.notificationType = this.notificationType[0].value;
								} else {
									sap.ui.core.Fragment.byId(
										"Z_DowntimeDialog",
										"SinglePMNotificationType"
									).setVisible(false);
									sap.ui.core.Fragment.byId(
										"Z_DowntimeDialog",
										"MultiPMNotificationType"
									).setVisible(true);
									sap.ui.core.Fragment.byId(
										"Z_DowntimeDialog",
										"MultiValue"
									).setSelectedKey(this.notificationType[0].value);
									this.PMNotification.notificationTypes = this.notificationType;
								}
							}
						} else {
							sap.ui.core.Fragment.byId(
								"Z_DowntimeDialog",
								"functionalLocation"
							).setVisible(false);
							sap.ui.core.Fragment.byId(
								"Z_DowntimeDialog",
								"equipment"
							).setVisible(false);
							sap.ui.core.Fragment.byId(
								"Z_DowntimeDialog",
								"SinglePMNotificationType"
							).setVisible(false);
							sap.ui.core.Fragment.byId(
								"Z_DowntimeDialog",
								"breakDown"
							).setVisible(false);
							sap.ui.core.Fragment.byId(
								"Z_DowntimeDialog",
								"MultiPMNotificationType"
							).setVisible(false);
						}
	
						if (this.downtimeData.nodeDataList !== undefined) {
							if (
								this.downtimeData.nodeDataList[0].technicalObject !== undefined
							) {
								for (
									var i = 0;
									i < this.downtimeData.nodeDataList[0].technicalObject.length;
									i++
								) {
									if (
										this.downtimeData.nodeDataList[0].technicalObject[i]
											.equipmentID !== "" ||
										this.downtimeData.nodeDataList[0].technicalObject[i]
											.flocID !== ""
									) {
										techObj1.push(
											this.downtimeData.nodeDataList[0].technicalObject[i]
										);
									}
								}
	
								this.oModel1 = new sap.ui.model.json.JSONModel();
								this.oModel1.setData({
									modelData: techObj1,
								});
								this.pmFLDialog.setModel(this.oModel1);
	
								var oBindingInfo = {};
								oBindingInfo.path = "/modelData";
	
								oBindingInfo.factory = jQuery.proxy(function (sId, oContext) {
									var oFloc = oContext.getProperty("flocID");
									var oEquip = oContext.getProperty("equipmentID");
									var oTemplate = new sap.m.ColumnListItem({
										cells: [
											new sap.m.Text({
												text: "{flocID}",
											}),
											new sap.m.Text({
												text:
													"{path:'equipmentID' , formatter:'sap.oee.ui.Formatter.formatRemoveLeadingZero'}",
											}),
										],
										type: "Active",
										press: [this.handleOKForFLDialog, this],
									});
	
									return oTemplate;
								}, this);
	
								this.pmList.bindAggregation("items", oBindingInfo);
								this.pmList.rerender();
							}
						}
	
						//Handled Later
						/*if(this.downtimeData.dcElement === sap.oee.ui.oeeConstants.dcElementType.changeover){
						  sap.ui.core.Fragment.byId("Z_DowntimeDialog", "downtimeDialog").setContentHeight("80%");
							  }else{
						  sap.ui.core.Fragment.byId("Z_DowntimeDialog", "downtimeDialog").setContentHeight("52%");
					  }*/
						//Added to handle Field Visibilty on downtime dialog due to duration/Micro Stoppage changes
	
						this.handleFieldVisibilityOfDowntimeDialog();
						this.oDowntimeDialog.open();
						//this.getPMNotification();
						////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
						/* Kaan Adamey 07.04.2020 
								  Duruş açılma popupında bildirim açmayı otomatik getirme.
								  */
						sap.ui.core.Fragment.byId(
							"Z_DowntimeDialog",
							"checkPMNotification"
						).setSelected(true);
						sap.ui.core.Fragment.byId(
							"Z_DowntimeDialog",
							"checkPMNotification"
						).setEnabled(false);
						this.openReportPMNotification();
						sap.ui.core.Fragment.byId(
							"Z_DowntimeDialog",
							"MultiPMNotificationType"
						).setVisible(true);
	
						this.PMNotification.notificationTypes = this.notificationType;
	
						if (!this.oTechObjModel)
							this.oTechObjModel = new sap.ui.model.json.JSONModel();
	
						this.oTechObjModel.setData({
							downtimeDataForModel: this.PMNotification,
						});
						this.oTechObjModel.setDefaultBindingMode(
							sap.ui.model.BindingMode.TwoWay
						);
						this.oDowntimeDialog.setModel(this.oTechObjModel, "PMNotification");
	
						////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
					},
	

            }
        );
    }
);
