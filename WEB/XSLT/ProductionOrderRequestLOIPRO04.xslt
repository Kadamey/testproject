<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sch="http://sap.com/xi/ME" xmlns:me="http://sap.com/xi/ME" xmlns:gdt="http://sap.com/xi/SAPGlobal/GDT" xmlns:meint="http://sap.com/xi/MEINT">
	<xsl:template match="/ZPP_SD_EKALAN">
		<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
			<soapenv:Header/>
			<soapenv:Body>
				<meint:ProductionOrderUpdateRequest_sync>
					<meint:ProductionOrder>
						<xsl:variable name="POValue">
							<xsl:call-template name="addShopOrder">
								<xsl:with-param name="shopOrder" select="IDOC/E1AFKOL/AUFNR"/>
							</xsl:call-template>
						</xsl:variable>
						<xsl:variable name="reworkOrderCodes">|RW01|RW02|</xsl:variable>
						<xsl:variable name="site" select="IDOC/E1AFKOL/WERKS"/>
						<!--	<xsl:variable name="router" select="concat('ROUTING_',IDOC/E1AFKOL/E1AFFLL/E1AFVOL[last()]/ARBPL)"/> -->
					<xsl:variable name="router" select="concat(IDOC/E1AFKOL/PLNNR,'-',IDOC/E1AFKOL/PLNAL)"/>
						<xsl:variable name="PO_STATUS_FLAG">
							<xsl:for-each select="IDOC/E1AFKOL/E1JSTKL">
								<xsl:variable name="PO_STATUS" select="STAT"/>
								<xsl:if test="$PO_STATUS='I0012' or $PO_STATUS='I0045' or $PO_STATUS='I0076'">
	                            	TRUE
	                            </xsl:if>
							</xsl:for-each>
						</xsl:variable>
						<xsl:variable name="material">
							<xsl:call-template name="addItem">
								<xsl:with-param name="item" select="IDOC/E1AFKOL/MATNR"/>
								<xsl:with-param name="itemExt" select="IDOC/E1AFKOL/MATNR_EXTERNAL"/>
								<xsl:with-param name="itemLong" select="IDOC/E1AFKOL/MATNR_LONG"/>
							</xsl:call-template>
						</xsl:variable>
						<sch:SiteRef>
							<sch:Site>
								<xsl:value-of select="$site"/>
							</sch:Site>
						</sch:SiteRef>
						<sch:ShopOrderIn>
							<sch:SiteRef>
								<sch:Site>
									<xsl:value-of select="$site"/>
								</sch:Site>
							</sch:SiteRef>
							<sch:ShopOrder>
								<xsl:value-of select="$POValue"/>
							</sch:ShopOrder>
							<sch:ShopOrderTypeRef>
								<xsl:choose>
									<xsl:when test="contains($reworkOrderCodes,concat('|', IDOC/E1AFKOL/AUART, '|'))">
										<sch:OrderType>REWORK</sch:OrderType>
									</xsl:when>
									<xsl:otherwise>
										<sch:OrderType>PRODUCTION</sch:OrderType>
									</xsl:otherwise>
								</xsl:choose>
							</sch:ShopOrderTypeRef>
							<xsl:choose>
								<xsl:when test="normalize-space($PO_STATUS_FLAG) != ''">
									<sch:StatusRef>
										<sch:Status>504</sch:Status>
									</sch:StatusRef>
								</xsl:when>
								<xsl:otherwise>
									<sch:StatusRef>
										<sch:Status>501</sch:Status>
									</sch:StatusRef>
								</xsl:otherwise>
							</xsl:choose>
							<sch:PlannedItemRef>
								<sch:Item>
									<xsl:value-of select="$material"/>
								</sch:Item>
								<sch:Revision>#</sch:Revision>
							</sch:PlannedItemRef>
							<xsl:variable name="priority" select="IDOC/E1AFKOL/APRIO"/>
							<xsl:if test="string-length(IDOC/E1AFKOL/APRIO) &gt; '0'">
								<xsl:choose>
									<xsl:when test="number($priority)">
										<sch:Priority>
											<xsl:value-of select="number($priority)*100"/>
										</sch:Priority>
									</xsl:when>
									<xsl:otherwise>
										<sch:Priority>500</sch:Priority>
									</xsl:otherwise>
								</xsl:choose>
							</xsl:if>
							<xsl:variable name="plannedStartDate" select="IDOC/E1AFKOL/GSTRS"/>
							<sch:PlannedStartDate>
								<xsl:variable name="plannedStartDateTime" select="IDOC/E1AFKOL/GSUZS"/>
								<xsl:choose>
									<xsl:when test="string($plannedStartDateTime)">
										<xsl:value-of select="concat(substring($plannedStartDate, 1, 4), '-', substring($plannedStartDate, 5, 2), '-', substring($plannedStartDate, 7, 2), 'T', substring($plannedStartDateTime, 1, 2), ':',substring($plannedStartDateTime, 3, 2),':',substring($plannedStartDateTime, 5, 2) )"/>
									</xsl:when>
									<xsl:otherwise>
										<xsl:value-of select="concat(substring($plannedStartDate, 1, 4), '-', substring($plannedStartDate, 5, 2), '-', substring($plannedStartDate, 7, 2), 'T00:00:01')"/>
									</xsl:otherwise>
								</xsl:choose>
							</sch:PlannedStartDate>
							<sch:PlannedCompleteDate>
								<xsl:variable name="plannedCompDate" select="IDOC/E1AFKOL/GLTRS"/>
								<xsl:variable name="plannedCompDateTime" select="IDOC/E1AFKOL/GLUZS"/>
								<xsl:choose>
									<xsl:when test="string($plannedCompDateTime)">
										<xsl:value-of select="concat(substring($plannedCompDate, 1, 4), '-', substring($plannedCompDate, 5, 2), '-', substring($plannedCompDate, 7, 2), 'T', substring($plannedCompDateTime, 1, 2), ':',substring($plannedCompDateTime, 3, 2),':',substring($plannedCompDateTime, 5, 2) )"/>
									</xsl:when>
									<xsl:otherwise>
										<xsl:value-of select="concat(substring($plannedCompDate, 1, 4), '-', substring($plannedCompDate, 5, 2), '-', substring($plannedCompDate, 7, 2), 'T23:59:59')"/>
									</xsl:otherwise>
								</xsl:choose>
							</sch:PlannedCompleteDate>
							<sch:OriginalPlannedStartDate>
								<xsl:value-of select="concat(substring($plannedStartDate, 1, 4), '-', substring($plannedStartDate, 5, 2), '-', substring($plannedStartDate, 7, 2), 'T00:00:01')"/>
							</sch:OriginalPlannedStartDate>
							<sch:QuantityToBuild>
								<xsl:value-of select="floor(IDOC/E1AFKOL/BMENGE)"/>
							</sch:QuantityToBuild>
							<sch:QuantityOrdered>
								<xsl:value-of select="floor(IDOC/E1AFKOL/BMENGE)"/>
							</sch:QuantityOrdered>
							<xsl:if test="IDOC/E1AFKOL/E1AFPOL[POSNR='0001']/KUNAG != '' and IDOC/E1AFKOL/E1AFPOL[POSNR='0001']/NAME1 != ''">
								<sch:CustomerRef>
									<sch:Customer>
										<xsl:value-of select="IDOC/E1AFKOL/E1AFPOL[POSNR='0001']/KUNAG"/>
									</sch:Customer>
								</sch:CustomerRef>
							</xsl:if>
							<xsl:if test="IDOC/E1AFKOL/STLAN != '' and IDOC/E1AFKOL/STLAL != ''">
								<sch:PlannedBOMRef>
									<sch:Bom>
										<xsl:value-of select="$POValue"/>
									</sch:Bom>
									<sch:Revision>#</sch:Revision>
								</sch:PlannedBOMRef>
							</xsl:if>
							<sch:PlannedRouterRef>
								<xsl:choose>
									<xsl:when test="IDOC/E1AFKOL/E1AFFLL/E1AFVOL/E1AFREF/MES_ROUTINGID">
										<sch:Router>
											<xsl:call-template name="getId">
												<xsl:with-param name="key" select="IDOC/E1AFKOL/E1AFFLL/E1AFVOL/E1AFREF/MES_ROUTINGID"/>
											</xsl:call-template>
										</sch:Router>
										<sch:Revision>
											<xsl:call-template name="getRevision">
												<xsl:with-param name="key" select="IDOC/E1AFKOL/E1AFFLL/E1AFVOL/E1AFREF/MES_ROUTINGID"/>
											</xsl:call-template>
										</sch:Revision>
									</xsl:when>
									<xsl:otherwise>
										<sch:Router>
											<xsl:value-of select="$router"/>
										</sch:Router>
										<sch:Revision>#</sch:Revision>
									</xsl:otherwise>
								</xsl:choose>
								<sch:RouterType>U</sch:RouterType>
							</sch:PlannedRouterRef>
							<sch:ErpOrder>true</sch:ErpOrder>
							<sch:AllowInqueueSfcOnSoClose>true</sch:AllowInqueueSfcOnSoClose>
							<sch:ErpUnitOfMeasure>
								<xsl:value-of select="IDOC/E1AFKOL/BMEINS"/>
							</sch:ErpUnitOfMeasure>
							<sch:UnderdeliveryTolerance>
								<xsl:value-of select="IDOC/E1AFKOL/E1AFPOL/UNTTO"/>
							</sch:UnderdeliveryTolerance>
							<sch:OverdeliveryTolerance>
								<xsl:value-of select="IDOC/E1AFKOL/E1AFPOL/UEBTO"/>
							</sch:OverdeliveryTolerance>
							<xsl:choose>
								<xsl:when test="IDOC/E1AFKOL/E1AFPOL/UEBTK='X'">
									<sch:UnlimitedOverdelivery>true</sch:UnlimitedOverdelivery>
								</xsl:when>
								<xsl:otherwise>
									<sch:UnlimitedOverdelivery>false</sch:UnlimitedOverdelivery>
								</xsl:otherwise>
							</xsl:choose>
							<sch:ShopOrderSelectionRulesList>
								<xsl:for-each select="IDOC/E1AFKOL/E1VCODR">
									<sch:ShopOrderSelectionRuleDetail>
										<sch:ErpSelectionRule>
											<xsl:value-of select="KNNAM"/>
										</sch:ErpSelectionRule>
										<sch:ErpSelectionValue>
											<xsl:value-of select="RESULT"/>
										</sch:ErpSelectionValue>
									</sch:ShopOrderSelectionRuleDetail>
								</xsl:for-each>
							</sch:ShopOrderSelectionRulesList>
							<xsl:for-each select="IDOC/E1AFKOL/E1AFPOL[POSNR='0001']">
								<sch:ErpPutawayStorageLocation>
									<xsl:value-of select="LGORT"/>
								</sch:ErpPutawayStorageLocation>
								<sch:BatchNumber>
									<xsl:value-of select="CHARG"/>
								</sch:BatchNumber>
								<sch:WarehouseNumber>
									<xsl:value-of select="LGNUM"/>
								</sch:WarehouseNumber>
							</xsl:for-each>
							<sch:ShopOrderSFCPlanList>
								<xsl:for-each select="IDOC/E1AFKOL/E1AFPOL/E1AFSER">
									<sch:ShopOrderSFCPlan>
										<xsl:if test="not(contains($reworkOrderCodes,concat('|', ../../AUART, '|')))">
											<sch:Sfc>
												<xsl:value-of select="concat($material, '-', SERNR)"/>
											</sch:Sfc>
											<sch:IsErpSfcNumber>true</sch:IsErpSfcNumber>
										</xsl:if>
										<!--
                                        <xsl:if test="contains($reworkOrderCodes,concat('|', ../../AUART, '|'))">
	                                        <sch:OriginalSerialNumber><xsl:value-of select="SERNR"/></sch:OriginalSerialNumber>
                                        	<sch:IsErpOriginalSerialNumber>true</sch:IsErpOriginalSerialNumber>
                                        </xsl:if>
                                        -->
										<sch:SerialNumber>
											<xsl:value-of select="SERNR"/>
										</sch:SerialNumber>
										<sch:IsErpSerialNumber>true</sch:IsErpSerialNumber>
									</sch:ShopOrderSFCPlan>
								</xsl:for-each>
							</sch:ShopOrderSFCPlanList>
							<xsl:if test="IDOC/E1AFKOL/E1AFFLL/E1AFVOL/E1QAMVL">
								<sch:InspectionLot>
									<xsl:value-of select="string(floor(IDOC/E1AFKOL/PRUEFLOS))"/>
								</sch:InspectionLot>
								<sch:InspectionGroupSize>
									<xsl:value-of select="floor(IDOC/E1AFKOL/BMENGE)"/>
								</sch:InspectionGroupSize>
							</xsl:if>
							<sch:ShopOrderInspectionLotList>
								<xsl:for-each select="IDOC/E1AFKOL/E1AFFLL">
									<xsl:sort select="PLNFL"/>
									<xsl:if test="FLGAT = 0">
										<xsl:for-each select="E1AFVOL[E1JSTVL[last()]/STAT!='I0013']">
											<xsl:sort select="VORNR"/>
											<xsl:variable name="seqCounter" select="position()"/>
											<xsl:if test="E1QAMVL">
												<sch:ShopOrderInspectionLot>
													<sch:ShopOrderRef>
														<sch:ShopOrder>
															<xsl:value-of select="$POValue"/>
														</sch:ShopOrder>
														<sch:SiteRef>
															<sch:Site>
																<xsl:value-of select="$site"/>
															</sch:Site>
														</sch:SiteRef>
													</sch:ShopOrderRef>
													<sch:RouterStepRef>
														<sch:RouterRef>
															<sch:SiteRef>
																<sch:Site>
																	<xsl:value-of select="$site"/>
																</sch:Site>
															</sch:SiteRef>
															<xsl:choose>
																<xsl:when test="E1AFREF/MES_ROUTINGID">
																	<sch:Router>
																		<xsl:call-template name="getId">
																			<xsl:with-param name="key" select="E1AFREF/MES_ROUTINGID"/>
																		</xsl:call-template>
																	</sch:Router>
																	<sch:Revision>
																		<xsl:call-template name="getRevision">
																			<xsl:with-param name="key" select="E1AFREF/MES_ROUTINGID"/>
																		</xsl:call-template>
																	</sch:Revision>
																</xsl:when>
																<xsl:otherwise>
																	<sch:Router>
																		<xsl:value-of select="$router"/>
																	</sch:Router>
																	<sch:Revision>#</sch:Revision>
																</xsl:otherwise>
															</xsl:choose>
															<sch:RouterType>U</sch:RouterType>
														</sch:RouterRef>
														<sch:StepId>
															<xsl:choose>
																<xsl:when test="E1AFREF/MES_STEPID">
																	<xsl:value-of select="E1AFREF/MES_STEPID"/>
																</xsl:when>
																<xsl:otherwise>
																	<xsl:number value="$seqCounter*10" format="1"/>
																</xsl:otherwise>
															</xsl:choose>
														</sch:StepId>
													</sch:RouterStepRef>
													<sch:InspectionSampleSize>
														<xsl:choose>
															<xsl:when test="SAMPLE_SIZE_ALL">
																<xsl:value-of select="SAMPLE_SIZE_ALL"/>
															</xsl:when>
															<xsl:otherwise>
																<xsl:value-of select="SAMPLE_SIZE"/>
															</xsl:otherwise>
														</xsl:choose>
													</sch:InspectionSampleSize>
												</sch:ShopOrderInspectionLot>
											</xsl:if>
										</xsl:for-each>
									</xsl:if>
								</xsl:for-each>
							</sch:ShopOrderInspectionLotList>
							<sch:ShopOrderScheduleList>
								<xsl:for-each select="IDOC/E1AFKOL/E1AFFLL/E1AFVOL">
									<xsl:variable name="stepCounter" select="position()"/>
									<xsl:choose>
										<xsl:when test="E1KBEDL[SPLIT!='0']">
											<xsl:variable name="parentCapacityId" select="E1KBEDL[SPLIT='0']/KAPID"/>
											<xsl:for-each select="E1KBEDL[SPLIT!='0']">
												<xsl:variable name="splitCounter" select="position()"/>
												<sch:ShopOrderSchedule>
													<sch:routerStepRef>
														<sch:RouterRef>
															<sch:SiteRef>
																<sch:Site>
																	<xsl:value-of select="$site"/>
																</sch:Site>
															</sch:SiteRef>
															<xsl:choose>
																<xsl:when test="../E1AFREF/MES_ROUTINGID">
																	<sch:Router>
																		<xsl:call-template name="getId">
																			<xsl:with-param name="key" select="../E1AFREF/MES_ROUTINGID"/>
																		</xsl:call-template>
																	</sch:Router>
																	<sch:Revision>
																		<xsl:call-template name="getRevision">
																			<xsl:with-param name="key" select="../E1AFREF/MES_ROUTINGID"/>
																		</xsl:call-template>
																	</sch:Revision>
																</xsl:when>
																<xsl:otherwise>
																	<sch:Router>
																		<xsl:value-of select="$router"/>
																	</sch:Router>
																	<sch:Revision>#</sch:Revision>
																</xsl:otherwise>
															</xsl:choose>
															<sch:RouterType>U</sch:RouterType>
														</sch:RouterRef>
														<sch:StepId>
															<xsl:choose>
																<xsl:when test="../E1AFREF/MES_STEPID">
																	<xsl:value-of select="../E1AFREF/MES_STEPID"/>
																</xsl:when>
																<xsl:otherwise>
																	<xsl:number value="$stepCounter*10" format="1"/>
																</xsl:otherwise>
															</xsl:choose>
														</sch:StepId>
													</sch:routerStepRef>
													<sch:sequence>
														<xsl:number value="$splitCounter*10" format="1"/>
													</sch:sequence>
													<xsl:if test="KAPNAME">
														<sch:resourceRef>
															<sch:SiteRef>
																<sch:Site>
																	<xsl:value-of select="$site"/>
																</sch:Site>
															</sch:SiteRef>
															<sch:Resource>
																<xsl:value-of select="KAPNAME"/>
															</sch:Resource>
														</sch:resourceRef>
													</xsl:if>
													<xsl:if test="not(KAPID=$parentCapacityId)">
														<sch:resourceErpInternalId>
															<xsl:value-of select="KAPID"/>
														</sch:resourceErpInternalId>
													</xsl:if>
													<sch:splitId>
														<xsl:value-of select="SPLIT"/>
													</sch:splitId>
													<sch:plannedQuantity>
														<xsl:value-of select="floor(MGVRG)"/>
													</sch:plannedQuantity>
													<me:startDate>
														<xsl:variable name="startDate" select="FSTAD"/>
														<xsl:variable name="startDateTime" select="FSTAU"/>
														<xsl:choose>
															<xsl:when test="string($startDateTime)">
																<xsl:value-of select="concat(substring($startDate, 1, 4), '-', substring($startDate, 5, 2), '-', substring($startDate, 7, 2), 'T', substring($startDateTime, 1, 2), ':',substring($startDateTime, 3, 2),':',substring($startDateTime, 5, 2) )"/>
															</xsl:when>
															<xsl:otherwise>
																<xsl:value-of select="concat(substring($startDate, 1, 4), '-', substring($startDate, 5, 2), '-', substring($startDate, 7, 2), 'T00:00:01')"/>
															</xsl:otherwise>
														</xsl:choose>
													</me:startDate>
													<me:endDate>
														<xsl:variable name="endDate" select="FENDD"/>
														<xsl:variable name="endDateTime" select="FENDU"/>
														<xsl:choose>
															<xsl:when test="string($endDateTime)">
																<xsl:value-of select="concat(substring($endDate, 1, 4), '-', substring($endDate, 5, 2), '-', substring($endDate, 7, 2), 'T', substring($endDateTime, 1, 2), ':',substring($endDateTime, 3, 2),':',substring($endDateTime, 5, 2) )"/>
															</xsl:when>
															<xsl:otherwise>
																<xsl:value-of select="concat(substring($endDate, 1, 4), '-', substring($endDate, 5, 2), '-', substring($endDate, 7, 2), 'T00:00:01')"/>
															</xsl:otherwise>
														</xsl:choose>
													</me:endDate>
												</sch:ShopOrderSchedule>
											</xsl:for-each>
										</xsl:when>
										<xsl:otherwise>
											<sch:ShopOrderSchedule>
												<sch:routerStepRef>
													<sch:RouterRef>
														<sch:SiteRef>
															<sch:Site>
																<xsl:value-of select="$site"/>
															</sch:Site>
														</sch:SiteRef>
														<xsl:choose>
															<xsl:when test="E1AFREF/MES_ROUTINGID">
																<sch:Router>
																	<xsl:call-template name="getId">
																		<xsl:with-param name="key" select="E1AFREF/MES_ROUTINGID"/>
																	</xsl:call-template>
																</sch:Router>
																<sch:Revision>
																	<xsl:call-template name="getRevision">
																		<xsl:with-param name="key" select="E1AFREF/MES_ROUTINGID"/>
																	</xsl:call-template>
																</sch:Revision>
															</xsl:when>
															<xsl:otherwise>
																<sch:Router>
																	<xsl:value-of select="$router"/>
																</sch:Router>
																<sch:Revision>#</sch:Revision>
															</xsl:otherwise>
														</xsl:choose>
														<sch:RouterType>U</sch:RouterType>
													</sch:RouterRef>
													<sch:StepId>
														<xsl:choose>
															<xsl:when test="E1AFREF/MES_STEPID">
																<xsl:value-of select="E1AFREF/MES_STEPID"/>
															</xsl:when>
															<xsl:otherwise>
																<xsl:number value="$stepCounter*10" format="1"/>
															</xsl:otherwise>
														</xsl:choose>
													</sch:StepId>
												</sch:routerStepRef>
												<sch:sequence>10</sch:sequence>
												<sch:splitId>OPS</sch:splitId>
												<sch:plannedQuantity>
													<xsl:value-of select="floor(../../BMENGE)"/>
												</sch:plannedQuantity>
												<me:startDate>
													<xsl:variable name="startDate" select="FSAVD"/>
													<xsl:variable name="startDateTime" select="FSAVZ"/>
													<xsl:choose>
														<xsl:when test="string($startDateTime)">
															<xsl:value-of select="concat(substring($startDate, 1, 4), '-', substring($startDate, 5, 2), '-', substring($startDate, 7, 2), 'T', substring($startDateTime, 1, 2), ':',substring($startDateTime, 3, 2),':',substring($startDateTime, 5, 2) )"/>
														</xsl:when>
														<xsl:otherwise>
															<xsl:value-of select="concat(substring($startDate, 1, 4), '-', substring($startDate, 5, 2), '-', substring($startDate, 7, 2), 'T00:00:01')"/>
														</xsl:otherwise>
													</xsl:choose>
												</me:startDate>
												<me:endDate>
													<xsl:variable name="endDate" select="FSSAD"/>
													<xsl:variable name="endDateTime" select="FSSAZ"/>
													<xsl:choose>
														<xsl:when test="string($endDateTime)">
															<xsl:value-of select="concat(substring($endDate, 1, 4), '-', substring($endDate, 5, 2), '-', substring($endDate, 7, 2), 'T', substring($endDateTime, 1, 2), ':',substring($endDateTime, 3, 2),':',substring($endDateTime, 5, 2) )"/>
														</xsl:when>
														<xsl:otherwise>
															<xsl:value-of select="concat(substring($endDate, 1, 4), '-', substring($endDate, 5, 2), '-', substring($endDate, 7, 2), 'T00:00:01')"/>
														</xsl:otherwise>
													</xsl:choose>
												</me:endDate>
											</sch:ShopOrderSchedule>
										</xsl:otherwise>
									</xsl:choose>
								</xsl:for-each>
							</sch:ShopOrderScheduleList>
							<sch:ShopOrderCharacteristicsList>
								<xsl:for-each select="IDOC/E1AFKOL/E1VCCHR">
									<sch:ShopOrderCharacteristics>
										<sch:characteristicName>
											<xsl:value-of select="ATNAM"/>
										</sch:characteristicName>
										<sch:characteristicValue>
											<xsl:value-of select="ATWRT"/>
										</sch:characteristicValue>
										<sch:ShopOrderCharacteristicTranslationList>
											<xsl:for-each select="E1VCCHT">
												<sch:ShopOrderCharacteristicT>
													<sch:locale>
														<xsl:value-of select="translate(LAISO, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')"/>
													</sch:locale>
													<sch:characteristicDescription>
														<xsl:value-of select="ATBEZ"/>
													</sch:characteristicDescription>
													<sch:characteristicValueDesc>
														<xsl:value-of select="ATWTB"/>
													</sch:characteristicValueDesc>
												</sch:ShopOrderCharacteristicT>
											</xsl:for-each>
										</sch:ShopOrderCharacteristicTranslationList>
									</sch:ShopOrderCharacteristics>
								</xsl:for-each>
							</sch:ShopOrderCharacteristicsList>
						</sch:ShopOrderIn>
						<xsl:if test="normalize-space($PO_STATUS_FLAG) = ''">
							<xsl:if test="IDOC/E1AFKOL/STLAN != '' and IDOC/E1AFKOL/STLAL != ''">
								<sch:BOMIn>
									<sch:SiteRef>
										<sch:Site>
											<xsl:value-of select="$site"/>
										</sch:Site>
									</sch:SiteRef>
									<sch:Bom>
									<xsl:value-of select="$POValue"/>
									</sch:Bom>
									<sch:StatusRef>
										<sch:Status>201</sch:Status>
									</sch:StatusRef>
									<sch:Description>
										<xsl:call-template name="addItem">
											<xsl:with-param name="item" select="IDOC/E1AFKOL/MATNR"/>
											<xsl:with-param name="itemExt" select="IDOC/E1AFKOL/MATNR_EXTERNAL"/>
											<xsl:with-param name="itemLong" select="IDOC/E1AFKOL/MATNR_LONG"/>
										</xsl:call-template>
									</sch:Description>
									<sch:ErpBom>
										<xsl:value-of select="IDOC/E1AFKOL/STLNR"/>
									</sch:ErpBom>
									<sch:BomType>H</sch:BomType>
									<sch:EffectivityControl>R</sch:EffectivityControl>
									<sch:CurrentRevision>true</sch:CurrentRevision>
									<sch:BomComponentList>
										<xsl:for-each select="IDOC/E1AFKOL/E1AFFLL/E1AFVOL/E1RESBL">
											<xsl:sort select="RSPOS"/>
											<xsl:variable name="totalQty">
												<xsl:choose>
													<xsl:when test="string(ALPGR)">
														<xsl:choose>
															<xsl:when test="number(ALPRF)=1">
																<xsl:choose>
																	<xsl:when test="string(ASQTY)">
																		<xsl:value-of select="ASQTY"/>
																	</xsl:when>
																	<xsl:otherwise>
																		<xsl:value-of select="NOMNG"/>
																	</xsl:otherwise>
																</xsl:choose>
															</xsl:when>
															<xsl:otherwise>
																<xsl:value-of select="0"/>
															</xsl:otherwise>
														</xsl:choose>
													</xsl:when>
													<xsl:otherwise>
														<xsl:choose>
															<xsl:when test="string(ASQTY)">
																<xsl:value-of select="ASQTY"/>
															</xsl:when>
															<xsl:otherwise>
																<xsl:value-of select="BDMNG"/>
															</xsl:otherwise>
														</xsl:choose>
													</xsl:otherwise>
												</xsl:choose>
											</xsl:variable>
											<xsl:variable name="phType" select="DUMPS"/>
											<xsl:if test="string(MATNR|MATNR_EXTERNAL|MATNR_LONG) and number(AFPOS)!=1">
												<sch:BomComponent>
													<sch:Component>
														<sch:Item>
															<xsl:call-template name="addItem">
																<xsl:with-param name="item" select="MATNR"/>
																<xsl:with-param name="itemExt" select="MATNR_EXTERNAL"/>
																<xsl:with-param name="itemLong" select="MATNR_LONG"/>
															</xsl:call-template>
														</sch:Item>
														<sch:Revision>#</sch:Revision>
													</sch:Component>
													<sch:Sequence>
														<xsl:value-of select="string(number(RSPOS)*10)"/>
													</sch:Sequence>
													<sch:ErpSequence>
														<xsl:value-of select="number(POSNR)"/>
													</sch:ErpSequence>
													<xsl:variable name="parentRef" select="MRPOS"/>
													<xsl:variable name="parentSeq" select="string(number($parentRef))"/>
													<xsl:choose>
                                                    
														<!-- PHANTOM COMPONENT-->
														<xsl:when test="$phType='X'">
															<xsl:if test="MRPOS!='0000'">
																<sch:ParentSequence>
																	<xsl:value-of select="$parentSeq*10"/>
																</sch:ParentSequence>
															</xsl:if>
															<sch:BomComponentType>P</sch:BomComponentType>
														</xsl:when>
														<!-- BY PRODUCT -->
														<xsl:when test="SHKZG='S' and string(KZKUP)=''">
															<xsl:if test="MRPOS!='0000'">
																<sch:ParentSequence>
																	<xsl:value-of select="$parentSeq*10"/>
																</sch:ParentSequence>
															</xsl:if>
															<sch:BomComponentType>B</sch:BomComponentType>
														</xsl:when>
                                                        	<!-- BY PYP ARGE MATERIAL 12042021 -->
														<xsl:when test="SOBKZ='Q'">
															<xsl:if test="MRPOS!='0000'">
																<sch:ParentSequence>
																	<xsl:value-of select="$parentSeq*10"/>
																</sch:ParentSequence>
															</xsl:if>
															<sch:BomComponentType>N</sch:BomComponentType>
                                                            		 <sch:CustomFieldList>
										<sch:CustomField>
                                        
											<sch:Attribute>Z_SOBKZ</sch:Attribute>
											<sch:Value>
												Q
											</sch:Value>
										</sch:CustomField>
									</sch:CustomFieldList>
                                                         
														</xsl:when>


														<!-- CO PRODUCT -->
														<xsl:when test="SHKZG='S' and string(KZKUP)='X'">
															<xsl:if test="MRPOS!='0000'">
																<sch:ParentSequence>
																	<xsl:value-of select="$parentSeq*10"/>
																</sch:ParentSequence>
															</xsl:if>
															<sch:BomComponentType>C</sch:BomComponentType>
															<sch:OrderItemNum>
																<xsl:value-of select="string(number(AFPOS))"/>
															</sch:OrderItemNum>
														</xsl:when>
														<!-- NORMAL COMPONENT -->
														<xsl:otherwise>
															<xsl:if test="MRPOS!='0000'">
																<sch:ParentSequence>
																	<xsl:value-of select="$parentSeq*10"/>
																</sch:ParentSequence>
															</xsl:if>
															<sch:BomComponentType>N</sch:BomComponentType>
														</xsl:otherwise>
													</xsl:choose>
													<sch:Enabled>true</sch:Enabled>
													<sch:Quantity>
														<xsl:variable name="releasedQty" select="//IDOC/E1AFKOL/BMENGE"/>
														<xsl:value-of select="$totalQty div $releasedQty"/>
													</sch:Quantity>
													<sch:UseItemDefaults>false</sch:UseItemDefaults>
													<sch:PreAssembled>false</sch:PreAssembled>
													<sch:AssembleAsRequired>false</sch:AssembleAsRequired>
													<sch:TestPart>false</sch:TestPart>
													<sch:CreateTrackableSFC>I</sch:CreateTrackableSFC>
													<xsl:if test="string(LGORT)">
														<sch:StorageLocationRef>
															<sch:StorageLocation>
																<xsl:value-of select="LGORT"/>
															</sch:StorageLocation>
														</sch:StorageLocationRef>
													</xsl:if>
													
														<sch:BomRefDesList>2</sch:BomRefDesList>
												
													<xsl:if test="string(RSNUM)">
														<sch:ReservationOrderNumber>
															<xsl:value-of select="RSNUM"/>
														</sch:ReservationOrderNumber>
													</xsl:if>
													<xsl:if test="string(RSPOS)">
														<sch:ReservationItemNumber>
															<xsl:value-of select="RSPOS"/>
														</sch:ReservationItemNumber>
													</xsl:if>
													<xsl:if test="string(AFPOS) and string(KZKUP)='X' and string(AFPOS)!='0000' and string(AFPOS)!='0001' ">
														<sch:ErpOrderItemNumber>
															<xsl:value-of select="AFPOS"/>
														</sch:ErpOrderItemNumber>
													</xsl:if>
													<sch:BomOperation>
														<xsl:variable name="bomOperation">
															<xsl:choose>
																<xsl:when test="../E1AFREF/MES_OPERID">
																	<xsl:call-template name="getId">
																		<xsl:with-param name="key" select="../E1AFREF/MES_OPERID"/>
																	</xsl:call-template>
																</xsl:when>
																<xsl:when test="../ME_OPERATION_ID">
																	<xsl:value-of select="../ME_OPERATION_ID"/>
																</xsl:when>
																<xsl:otherwise>
																	<xsl:value-of select="$router"/>-<xsl:value-of select="../../PLNFL"/>-<xsl:value-of select="../VORNR"/>
																</xsl:otherwise>
															</xsl:choose>
														</xsl:variable>
														<sch:OperationRef>
															<xsl:choose>
																<xsl:when test="$bomOperation !='' ">
																	<sch:Operation>
																		<xsl:value-of select="$bomOperation"/>
																	</sch:Operation>
																	<sch:Revision>#</sch:Revision>
																</xsl:when>
																<xsl:when test="../ME_OPERATION_ID">
																	<sch:Operation>
																		<xsl:value-of select="../ME_OPERATION_ID"/>
																	</sch:Operation>
																	<sch:Revision>#</sch:Revision>
																</xsl:when>
																<xsl:otherwise>
																	<sch:Operation>
																		<xsl:value-of select="$router"/>-<xsl:value-of select="../../PLNFL"/>-<xsl:value-of select="../VORNR"/>
																	</sch:Operation>
																	<sch:Revision>#</sch:Revision>
																</xsl:otherwise>
															</xsl:choose>
														</sch:OperationRef>

                                                           
														<sch:Quantity>
															<xsl:variable name="releasedQty" select="//IDOC/E1AFKOL/BMENGE"/>
															<xsl:value-of select="$totalQty div $releasedQty"/>
														</sch:Quantity>
													</sch:BomOperation>



                                       
												</sch:BomComponent>
											</xsl:if>
										</xsl:for-each>

                                      
									</sch:BomComponentList>
									<sch:CustomFieldList>
										<sch:CustomField>
											<sch:Attribute>ERP_MATERIAL</sch:Attribute>
											<sch:Value>
												<xsl:call-template name="addItem">
													<xsl:with-param name="item" select="IDOC/E1AFKOL/MATNR"/>
													<xsl:with-param name="itemExt" select="IDOC/E1AFKOL/MATNR_EXTERNAL"/>
													<xsl:with-param name="itemLong" select="IDOC/E1AFKOL/MATNR_LONG"/>
												</xsl:call-template>
											</sch:Value>
										</sch:CustomField>
									</sch:CustomFieldList>
								</sch:BOMIn>
							</xsl:if>
							<xsl:if test="not(IDOC/E1AFKOL/E1AFFLL/E1AFVOL/E1AFREF/MES_ROUTINGID)">
								<meint:Routing>
									<sch:RouterIn>
										<sch:SiteRef>
											<sch:Site>
												<xsl:value-of select="$site"/>
											</sch:Site>
										</sch:SiteRef>
										<sch:Item>
											<xsl:value-of select="IDOC/E1AFKOL/MATNR"/>
										</sch:Item>
										<xsl:variable name="materialNumber">
											<xsl:call-template name="trimItemLeadingZeros">
												<xsl:with-param name="item" select="IDOC/E1AFKOL/MATNR"/>
												<xsl:with-param name="itemExt" select="IDOC/E1AFKOL/MATNR_EXTERNAL"/>
												<xsl:with-param name="itemLong" select="IDOC/E1AFKOL/MATNR_LONG"/>
											</xsl:call-template>
										</xsl:variable>
										<sch:Router>
											<xsl:value-of select="$router"/>
										</sch:Router>
										<sch:RouterType>U</sch:RouterType>
										<sch:Description>
											<xsl:call-template name="addItem">
												<xsl:with-param name="item" select="IDOC/E1AFKOL/MATNR"/>
												<xsl:with-param name="itemExt" select="IDOC/E1AFKOL/MATNR_EXTERNAL"/>
												<xsl:with-param name="itemLong" select="IDOC/E1AFKOL/MATNR_LONG"/>
											</xsl:call-template>
										</sch:Description>
										<sch:StatusRef>
											<sch:Status>201</sch:Status>
										</sch:StatusRef>
										<sch:EffectivityControl>R</sch:EffectivityControl>
										<sch:CurrentRevision>true</sch:CurrentRevision>
										<sch:TemporaryRouter>false</sch:TemporaryRouter>
										<sch:GenerateIsLastReportingStep>true</sch:GenerateIsLastReportingStep>
										<sch:Origin>E</sch:Origin>
										<sch:EntryRouterStepRef>
											<sch:RouterRef>
												<sch:Router>
													<xsl:value-of select="$router"/>
												</sch:Router>
												<sch:RouterType>U</sch:RouterType>
											</sch:RouterRef>
											<sch:StepId>10</sch:StepId>
										</sch:EntryRouterStepRef>
										<sch:RouterStepList>
											<xsl:for-each select="IDOC/E1AFKOL/E1AFFLL">
												<xsl:sort select="PLNFL"/>
												<xsl:if test="FLGAT = 0">
													<xsl:for-each select="E1AFVOL[E1JSTVL[last()]/STAT!='I0013']">
														<xsl:sort select="VORNR"/>
														<xsl:variable name="seqCounter" select="position()"/>
														<sch:RouterStep>
															<xsl:choose>
																<xsl:when test="RUEK">
																	<xsl:if test="RUEK!='3'">
																		<sch:ReportingStep>
																			<xsl:value-of select="VORNR"/>
																		</sch:ReportingStep>
																	</xsl:if>
																</xsl:when>
																<xsl:otherwise>
																	<sch:ReportingStep>
																		<xsl:value-of select="VORNR"/>
																	</sch:ReportingStep>
																</xsl:otherwise>
															</xsl:choose>
															<sch:ErpOperation>
																<xsl:value-of select="VORNR"/>
															</sch:ErpOperation>
															<sch:Rework>false</sch:Rework>
															<sch:RouterStepRef>
																<sch:StepId>
																	<xsl:number value="$seqCounter*10" format="1"/>
																</sch:StepId>
															</sch:RouterStepRef>
															<sch:ErpInternalID>
																<xsl:value-of select="ARBID"/>
															</sch:ErpInternalID>
															<sch:ErpSequence>0</sch:ErpSequence>
															<sch:QueueDecisionType>C</sch:QueueDecisionType>
															<xsl:choose>
																<xsl:when test="$seqCounter=count(../../E1AFFLL/E1AFVOL)">
																	<sch:ErpInspectionComplete>true</sch:ErpInspectionComplete>
																</xsl:when>
																<xsl:otherwise>
																	<sch:ErpInspectionComplete>false</sch:ErpInspectionComplete>
																</xsl:otherwise>
															</xsl:choose>
															<sch:Sequence>
																<xsl:number value="$seqCounter" format="1"/>
															</sch:Sequence>
															<sch:Description>
																<xsl:value-of select="LTXA1"/>
															</sch:Description>
															<sch:ControlKeyRef>
																<sch:ControlKey>
																	<xsl:value-of select="STEUS"/>
																</sch:ControlKey>
															</sch:ControlKeyRef>
															<sch:RouterStepAttachmentList>
																<xsl:for-each select="E1AFDOC/E1AFDPO">
																	<xsl:variable name="documentType" select="../DOKAR"/>
																	<xsl:if test="$documentType='PRT'">
																		<sch:RouterStepAttachment>
																			<sch:AttachedItem>
																				<xsl:call-template name="addWorkInstructionName">
																					<xsl:with-param name="docName" select="../DOKNR"/>
																					<xsl:with-param name="docType" select="../DOKAR"/>
																					<xsl:with-param name="docPart" select="../DOKTL"/>
																					<xsl:with-param name="docOriginal" select="ORIGINAL"/>
																				</xsl:call-template>
																			</sch:AttachedItem>
																			<sch:Revision>
																				<xsl:value-of select="../DOKVR"/>
																			</sch:Revision>
																			<sch:AttachmentType>W</sch:AttachmentType>
																		</sch:RouterStepAttachment>
																	</xsl:if>
																</xsl:for-each>
															</sch:RouterStepAttachmentList>
															<sch:RouterStepComponentList>
																<xsl:for-each select="E1RESBL[number(AFPOS)!=1]">
																	<sch:RouterStepComponent>
																		<sch:ItemRef>
																			<sch:SiteRef>
																				<sch:Site>
																					<xsl:value-of select="$site"/>
																				</sch:Site>
																			</sch:SiteRef>
																			<sch:Item>
																				<xsl:value-of select="MATNR"/>
																			</sch:Item>
																			<sch:Revision>#</sch:Revision>
																		</sch:ItemRef>
																		<sch:ErpSequence>
																			<xsl:value-of select="number(POSNR)"/>
																		</sch:ErpSequence>
																		<sch:Quantity>
																			<xsl:choose>
																				<xsl:when test="string(ASQTY)">
																					<xsl:value-of select="ASQTY"/>
																				</xsl:when>
																				<xsl:otherwise>
																					<xsl:value-of select="BDMNG"/>
																				</xsl:otherwise>
																			</xsl:choose>
																		</sch:Quantity>
																	</sch:RouterStepComponent>
																</xsl:for-each>
															</sch:RouterStepComponentList>
															<sch:RouterSubstepList>
																<xsl:for-each select="E1AFUVL[E1JSTUL[last()]/STAT!='I0013']">
																	<sch:RouterSubstep>
																		<xsl:variable name="seqSubstepCounter" select="position()"/>
																		<xsl:variable name="field1" select="//IDOC/E1AFKOL/PLNNR"/>
																		<xsl:variable name="field2" select="//IDOC/E1AFKOL/PLNAL"/>
																		<xsl:variable name="field3" select="../../PLNFL"/>
																		<xsl:variable name="field4" select="../VORNR"/>
																		<xsl:variable name="field5" select="UVORN"/>
																		<xsl:variable name="substep">
																			<xsl:choose>
																				<xsl:when test="ME_OPERATION_ID">
																					<xsl:value-of select="ME_OPERATION_ID"/>
																				</xsl:when>
																				<xsl:when test="../ME_OPERATION_ID">
																					<xsl:value-of select="concat(../ME_OPERATION_ID, '-',$field5)"/>
																				</xsl:when>
																				<xsl:otherwise>
																					<xsl:value-of select="concat($field1,'-',$field2, '-',$field3, '-',$field4, '-',$field5)"/>
																				</xsl:otherwise>
																			</xsl:choose>
																		</xsl:variable>
																		<xsl:variable name="substepRevision">
																			<xsl:choose>
																				<xsl:when test="ME_OPERATION_ID">
																					<xsl:choose>
																						<xsl:when test="ME_REVISION">
																							<xsl:value-of select="ME_REVISION"/>
																						</xsl:when>
																						<xsl:otherwise>#</xsl:otherwise>
																					</xsl:choose>
																				</xsl:when>
																				<xsl:otherwise>#</xsl:otherwise>
																			</xsl:choose>
																		</xsl:variable>
																		<sch:SubstepRef>
																			<sch:SiteRef>
																				<sch:Site>
																					<xsl:value-of select="$site"/>
																				</sch:Site>
																			</sch:SiteRef>
																			<sch:Substep>
																				<xsl:value-of select="$substep"/>
																			</sch:Substep>
																			<sch:SubstepId>
																				<xsl:number value="$seqSubstepCounter*10" format="1"/>
																			</sch:SubstepId>
																			<sch:Revision>
																				<xsl:value-of select="$substepRevision"/>
																			</sch:Revision>
																		</sch:SubstepRef>
																		<sch:CurrentRevision>true</sch:CurrentRevision>
																		<sch:StatusRef>
																			<sch:SiteRef>
																				<sch:Site>
																					<xsl:value-of select="$site"/>
																				</sch:Site>
																			</sch:SiteRef>
																			<sch:Status>RELEASABLE</sch:Status>
																		</sch:StatusRef>
																		<sch:SubstepType>NORMAL</sch:SubstepType>
																		<sch:SubstepDescription>
																			<xsl:value-of select="LTXA1"/>
																		</sch:SubstepDescription>
																		<sch:LongDescription>
																			<xsl:value-of select="LTXA1"/>
																		</sch:LongDescription>
																	</sch:RouterSubstep>
																</xsl:for-each>
															</sch:RouterSubstepList>
															<sch:RouterOperationList>
																<sch:RouterOperation>
																	<sch:OperationRef>
																		<xsl:choose>
																			<xsl:when test="ME_OPERATION_ID">
																				<sch:Operation>
																					<xsl:value-of select="ME_OPERATION_ID"/>
																				</sch:Operation>
																				<sch:Revision>#</sch:Revision>
																			</xsl:when>
																			<xsl:otherwise>
																				<sch:Operation>
																					<xsl:value-of select="$router"/>-<xsl:value-of select="//IDOC/E1AFKOL/E1AFFLL/PLNFL"/>-<xsl:value-of select="VORNR"/>
																				</sch:Operation>
																				<sch:Revision>#</sch:Revision>
																			</xsl:otherwise>
																		</xsl:choose>
																	</sch:OperationRef>
																	<sch:MaxLoop>0</sch:MaxLoop>
																	<sch:StepType>N</sch:StepType>
																</sch:RouterOperation>
															</sch:RouterOperationList>
															<sch:RouterComp>
																<sch:RouterOperation>
																	<sch:RouterStepRef>
																		<sch:StepId>
																			<xsl:number value="$seqCounter*10" format="1"/>
																		</sch:StepId>
																	</sch:RouterStepRef>
																</sch:RouterOperation>
															</sch:RouterComp>
															<sch:StepId>
																<xsl:number value="$seqCounter*10" format="1"/>
															</sch:StepId>
															<sch:RouterNextStepList>
																<xsl:for-each select="//IDOC/E1AFKOL/E1AFFLL/E1AFVOL[E1JSTVL[last()]/STAT!='I0013']">
																	<xsl:if test="position()=$seqCounter+1">
																		<sch:RouterNextStep>
																			<sch:NextStepRef>
																				<sch:StepId>
																					<xsl:number value="position()*10" format="1"/>
																				</sch:StepId>
																			</sch:NextStepRef>
																			<sch:FailurePath>false</sch:FailurePath>
																		</sch:RouterNextStep>
																	</xsl:if>
																</xsl:for-each>
															</sch:RouterNextStepList>
															<xsl:choose>
																<xsl:when test="ARBPL">
																	<sch:ErpWorkCenterRef>
																		<sch:WorkCenter>
																			<xsl:value-of select="ARBPL"/>
																		</sch:WorkCenter>
																	</sch:ErpWorkCenterRef>
																	<sch:ReportingCenterRef>
																		<sch:WorkCenter>
																			<xsl:value-of select="ARBPL"/>
																		</sch:WorkCenter>
																	</sch:ReportingCenterRef>
																</xsl:when>
																<xsl:otherwise>
																	<xsl:if test="not(contains(ARBID,'00000000'))">
																		<sch:ErpWorkCenterRef>
																			<sch:WorkCenter>ERP_ID:<xsl:value-of select="ARBID"/>
																			</sch:WorkCenter>
																		</sch:ErpWorkCenterRef>
																		<sch:ReportingCenterRef>
																			<sch:WorkCenter>ERP_ID:<xsl:value-of select="ARBID"/>
																			</sch:WorkCenter>
																		</sch:ReportingCenterRef>
																	</xsl:if>
																</xsl:otherwise>
															</xsl:choose>
														</sch:RouterStep>
													</xsl:for-each>
												</xsl:if>
												<xsl:if test="FLGAT != 0">
													<xsl:message terminate="yes">
                                                    Only SAP Standard Routers are supported.
                                                </xsl:message>
												</xsl:if>
											</xsl:for-each>
										</sch:RouterStepList>
										<sch:CustomFieldList>
											<sch:CustomField>
												<sch:Attribute>ERP_MATERIAL</sch:Attribute>
												<sch:Value>
													<xsl:call-template name="addItem">
														<xsl:with-param name="item" select="IDOC/E1AFKOL/MATNR"/>
														<xsl:with-param name="itemExt" select="IDOC/E1AFKOL/MATNR_EXTERNAL"/>
														<xsl:with-param name="itemLong" select="IDOC/E1AFKOL/MATNR_LONG"/>
													</xsl:call-template>
												</sch:Value>
											</sch:CustomField>
										</sch:CustomFieldList>
									</sch:RouterIn>
									<sch:OperationListIn>
										<xsl:for-each select="IDOC/E1AFKOL/E1AFFLL">
											<xsl:if test="FLGAT = 0">
												<xsl:for-each select="E1AFVOL[E1JSTVL[last()]/STAT!='I0013']">
													<sch:Operation>
														<xsl:choose>
															<xsl:when test="ME_OPERATION_ID">
																<sch:Operation>
																	<xsl:value-of select="ME_OPERATION_ID"/>
																</sch:Operation>
																<xsl:choose>
																	<xsl:when test="ME_REVISION">
																		<sch:Revision>
																			<xsl:value-of select="ME_REVISION"/>
																		</sch:Revision>
																	</xsl:when>
																	<xsl:otherwise>
																		<sch:Revision>#</sch:Revision>
																	</xsl:otherwise>
																</xsl:choose>
															</xsl:when>
															<xsl:otherwise>
																<sch:Operation>
																	<xsl:value-of select="$router"/>-<xsl:value-of select="//IDOC/E1AFKOL/E1AFFLL/PLNFL"/>-<xsl:value-of select="VORNR"/>
																</sch:Operation>
																<sch:Revision>#</sch:Revision>
															</xsl:otherwise>
														</xsl:choose>
														<sch:Description>
															<xsl:value-of select="LTXA1"/>
														</sch:Description>
														<sch:CurrentRevision>true</sch:CurrentRevision>
														<sch:MaxLoop>1</sch:MaxLoop>
														
														<xsl:choose>
															<xsl:when test="ME_RESOURCE_TYPE">
																<sch:ResourceTypeRef>
																	<sch:ResourceType>
																		<xsl:value-of select="ME_RESOURCE_TYPE"/>
																	</sch:ResourceType>
																</sch:ResourceTypeRef>
															</xsl:when>
															<xsl:otherwise>
																<sch:ResourceTypeRef>
																	<sch:ResourceType>DEFAULT</sch:ResourceType>
																</sch:ResourceTypeRef>
															</xsl:otherwise>
														</xsl:choose>
														<sch:StatusRef>
															<sch:Status>201</sch:Status>
														</sch:StatusRef>
														<sch:ErpInternalID>
															<xsl:value-of select="ARBID"/>
														</sch:ErpInternalID>
														<sch:ControlKeyRef>
															<sch:ControlKey>
																<xsl:value-of select="STEUS"/>
															</sch:ControlKey>
														</sch:ControlKeyRef>
														<sch:Type>N</sch:Type>
														<sch:EffectivityControl>R</sch:EffectivityControl>
														<xsl:choose>
															<xsl:when test="ARBPL">
																<sch:ErpWorkCenterRef>
																	<sch:WorkCenter>
																		<xsl:value-of select="ARBPL"/>
																	</sch:WorkCenter>
																</sch:ErpWorkCenterRef>
																<sch:ReportingCenterRef>
																	<sch:WorkCenter>
																		<xsl:value-of select="ARBPL"/>
																	</sch:WorkCenter>
																</sch:ReportingCenterRef>
															</xsl:when>
															<xsl:otherwise>
																<xsl:if test="not(contains(ARBID,'00000000'))">
																	<sch:ErpWorkCenterRef>
																		<sch:WorkCenter>ERP_ID:<xsl:value-of select="ARBID"/>
																		</sch:WorkCenter>
																	</sch:ErpWorkCenterRef>
																	<sch:ReportingCenterRef>
																		<sch:WorkCenter>ERP_ID:<xsl:value-of select="ARBID"/>
																		</sch:WorkCenter>
																	</sch:ReportingCenterRef>
																</xsl:if>
															</xsl:otherwise>
														</xsl:choose>
													</sch:Operation>
												</xsl:for-each>
											</xsl:if>
											<xsl:if test="FLGAT != 0">
												<xsl:message terminate="yes">
                                                Only SAP Standard Routers are supported.
                                            </xsl:message>
											</xsl:if>
										</xsl:for-each>
									</sch:OperationListIn>
									<!--
                                <xsl:if test="boolean(IDOC/E1AFKOL/E1AFFLL/E1AFVOL/E1AFDOC)">
                                    <meint:AttachmentList>
                                        <xsl:for-each select="IDOC/E1AFKOL/E1AFFLL">
                                            <xsl:sort select="PLNFL"/>
                                            <xsl:if test="FLGAT = 0">
                                                <xsl:for-each select="E1AFVOL[E1JSTVL[last()]/STAT!='I0013']">
                                                    <xsl:sort select="VORNR"/>
                                                    <xsl:if test="E1AFDOC">
                                                        <meint:ErpAttachment>
                                                            <me:OperationRef>
                                                                <me:Operation><xsl:value-of select="$router"/>-<xsl:value-of select="//IDOC/E1AFKOL/E1AFFLL/PLNFL"/>-<xsl:value-of select="VORNR"/></me:Operation>
                                                                <me:Revision>#</me:Revision>
                                                            </me:OperationRef>
                                                            <meint:AttachedToList>
                                                                <xsl:for-each select="E1AFDOC">
                                                                    <meint:AttachedTo>
                                                                        <meint:Sequence><xsl:number value="PSNFH" format="1"/></meint:Sequence>
                                                                        <me:WorkInstructionRef>
                                                                            <me:WorkInstruction><xsl:value-of select="concat(DOKNR,'-', DOKTL, '-', DOKAR)"/></me:WorkInstruction>
                                                                            <me:Revision><xsl:value-of select="DOKVR"/></me:Revision>
                                                                        </me:WorkInstructionRef>
                                                                    </meint:AttachedTo>
                                                                </xsl:for-each>
                                                            </meint:AttachedToList>
                                                        </meint:ErpAttachment>
                                                    </xsl:if>
                                                </xsl:for-each>
                                            </xsl:if>
                                        </xsl:for-each>
                                    </meint:AttachmentList>


                                </xsl:if>-->
									<xsl:if test="IDOC/E1AFKOL/E1AFFLL/E1AFVOL/*[starts-with(name(), 'VGE0')] and IDOC/E1AFKOL/E1AFFLL/E1AFVOL/*[starts-with(name(), 'VGW0')]!=0">
										<meint:ErpScheduleStandardIn>
											<sch:SiteRef>
												<sch:Site>
													<xsl:value-of select="$site"/>
												</sch:Site>
											</sch:SiteRef>
											<sch:StandardsSource>U</sch:StandardsSource>
											<sch:RouterRef>
												<sch:SiteRef>
													<sch:Site>
														<xsl:value-of select="$site"/>
													</sch:Site>
												</sch:SiteRef>
												<sch:Router>
													<xsl:value-of select="$router"/>
												</sch:Router>
												<sch:Revision>#</sch:Revision>
												<sch:RouterType>U</sch:RouterType>
											</sch:RouterRef>
											<sch:Source>
												<sch:ItemRef>
													<sch:Item>
														<xsl:value-of select="$material"/>
													</sch:Item>
													<sch:Revision>#</sch:Revision>
													<sch:SiteRef>
														<sch:Site>
															<xsl:value-of select="$site"/>
														</sch:Site>
													</sch:SiteRef>
												</sch:ItemRef>
											</sch:Source>
											<sch:ScheduleStandardDetailList>
												<xsl:for-each select="IDOC/E1AFKOL/E1AFFLL">
													<xsl:sort select="PLNFL"/>
													<xsl:if test="FLGAT = 0">
														<xsl:for-each select="E1AFVOL">
															<xsl:variable name="operationSeqCounter" select="position()"/>
															<xsl:variable name="operation">
																<xsl:choose>
																	<xsl:when test="ME_OPERATION_ID">
																		<xsl:value-of select="ME_OPERATION_ID"/>
																	</xsl:when>
																	<xsl:otherwise>
																		<xsl:value-of select="concat($router,'-',//IDOC/E1AFKOL/E1AFFLL/PLNFL,'-',VORNR)"/>
																	</xsl:otherwise>
																</xsl:choose>
															</xsl:variable>
															<xsl:variable name="operationRevision">
																<xsl:choose>
																	<xsl:when test="ME_OPERATION_ID">
																		<xsl:choose>
																			<xsl:when test="ME_REVISION">
																				<xsl:value-of select="ME_REVISION"/>
																			</xsl:when>
																			<xsl:otherwise>#</xsl:otherwise>
																		</xsl:choose>
																	</xsl:when>
																	<xsl:otherwise>#</xsl:otherwise>
																</xsl:choose>
															</xsl:variable>
															<xsl:if test="*[starts-with(name(), 'VGE0')] and *[starts-with(name(), 'VGW0')]!=0 and string(VGWTS)!=''">
																<sch:ScheduleStandardDetail>
																	<sch:OperationRef>
																		<sch:SiteRef>
																			<sch:Site>
																				<xsl:value-of select="$site"/>
																			</sch:Site>
																		</sch:SiteRef>
																		<sch:Operation>
																			<xsl:value-of select="$operation"/>
																		</sch:Operation>
																		<sch:Revision>
																			<xsl:value-of select="$operationRevision"/>
																		</sch:Revision>
																	</sch:OperationRef>
																	<sch:StepId>
																		<xsl:number value="$operationSeqCounter*10" format="1"/>
																	</sch:StepId>
																	<sch:RouterSubstepRef>
																		<sch:Substep>*</sch:Substep>
																		<sch:SubstepId>*</sch:SubstepId>
																	</sch:RouterSubstepRef>
																	<sch:standardValueKeyRef>
																		<sch:SiteRef>
																			<sch:Site>
																				<xsl:value-of select="$site"/>
																			</sch:Site>
																		</sch:SiteRef>
																		<sch:Name>
																			<xsl:value-of select="VGWTS"/>
																		</sch:Name>
																	</sch:standardValueKeyRef>
																	<sch:isERP>true</sch:isERP>
																	<xsl:if test="VGE01 and number(VGW01)!=0">
																		<sch:elapsedTimeOne>
																			<xsl:value-of select="number(VGW01)"/>
																		</sch:elapsedTimeOne>
																		<sch:elapsedTimeUnitsOne>
																			<xsl:call-template name="addTimeUnits">
																				<xsl:with-param name="erpTimeUnits" select="VGE01"/>
																			</xsl:call-template>
																		</sch:elapsedTimeUnitsOne>
																	</xsl:if>
																	<xsl:if test="VGE02 and number(VGW02)!=0">
																		<sch:elapsedTimeTwo>
																			<xsl:value-of select="number(VGW02)"/>
																		</sch:elapsedTimeTwo>
																		<sch:elapsedTimeUnitsTwo>
																			<xsl:call-template name="addTimeUnits">
																				<xsl:with-param name="erpTimeUnits" select="VGE02"/>
																			</xsl:call-template>
																		</sch:elapsedTimeUnitsTwo>
																	</xsl:if>
																	<xsl:if test="VGE03 and number(VGW03)!=0">
																		<sch:elapsedTimeThree>
																			<xsl:value-of select="number(VGW03)"/>
																		</sch:elapsedTimeThree>
																		<sch:elapsedTimeUnitsThree>
																			<xsl:call-template name="addTimeUnits">
																				<xsl:with-param name="erpTimeUnits" select="VGE03"/>
																			</xsl:call-template>
																		</sch:elapsedTimeUnitsThree>
																	</xsl:if>
																	<xsl:if test="VGE04 and number(VGW04)!=0">
																		<sch:elapsedTimeFour>
																			<xsl:value-of select="number(VGW04)"/>
																		</sch:elapsedTimeFour>
																		<sch:elapsedTimeUnitsFour>
																			<xsl:call-template name="addTimeUnits">
																				<xsl:with-param name="erpTimeUnits" select="VGE04"/>
																			</xsl:call-template>
																		</sch:elapsedTimeUnitsFour>
																	</xsl:if>
																	<xsl:if test="VGE05 and number(VGW05)!=0">
																		<sch:elapsedTimeFive>
																			<xsl:value-of select="number(VGW05)"/>
																		</sch:elapsedTimeFive>
																		<sch:elapsedTimeUnitsFive>
																			<xsl:call-template name="addTimeUnits">
																				<xsl:with-param name="erpTimeUnits" select="VGE05"/>
																			</xsl:call-template>
																		</sch:elapsedTimeUnitsFive>
																	</xsl:if>
																	<xsl:if test="VGE06 and number(VGW06)!=0">
																		<sch:elapsedTimeSix>
																			<xsl:value-of select="number(VGW06)"/>
																		</sch:elapsedTimeSix>
																		<sch:elapsedTimeUnitsSix>
																			<xsl:call-template name="addTimeUnits">
																				<xsl:with-param name="erpTimeUnits" select="VGE06"/>
																			</xsl:call-template>
																		</sch:elapsedTimeUnitsSix>
																	</xsl:if>
																</sch:ScheduleStandardDetail>
															</xsl:if>
															<xsl:for-each select="E1AFUVL">
																<xsl:variable name="seqSubstepCounter" select="position()"/>
																<xsl:variable name="substep">
																	<xsl:choose>
																		<xsl:when test="ME_OPERATION_ID">
																			<xsl:value-of select="ME_OPERATION_ID"/>
																		</xsl:when>
																		<xsl:otherwise>
																			<xsl:value-of select="concat($operation,'-',UVORN)"/>
																		</xsl:otherwise>
																	</xsl:choose>
																</xsl:variable>
																<xsl:if test="*[starts-with(name(), 'VGE0')] and *[starts-with(name(), 'VGW0')]!=0 and string(VGWTS)!=''">
																	<sch:ScheduleStandardDetail>
																		<sch:OperationRef>
																			<sch:SiteRef>
																				<sch:Site>
																					<xsl:value-of select="$site"/>
																				</sch:Site>
																			</sch:SiteRef>
																			<sch:Operation>
																				<xsl:value-of select="$operation"/>
																			</sch:Operation>
																			<sch:Revision>
																				<xsl:value-of select="$operationRevision"/>
																			</sch:Revision>
																		</sch:OperationRef>
																		<sch:StepId>
																			<xsl:number value="$operationSeqCounter*10" format="1"/>
																		</sch:StepId>
																		<sch:RouterSubstepRef>
																			<sch:Substep>
																				<xsl:value-of select="$substep"/>
																			</sch:Substep>
																			<sch:SubstepId>
																				<xsl:number value="$seqSubstepCounter*10" format="1"/>
																			</sch:SubstepId>
																		</sch:RouterSubstepRef>
																		<sch:standardValueKeyRef>
																			<sch:SiteRef>
																				<sch:Site>
																					<xsl:value-of select="$site"/>
																				</sch:Site>
																			</sch:SiteRef>
																			<sch:Name>
																				<xsl:value-of select="VGWTS"/>
																			</sch:Name>
																		</sch:standardValueKeyRef>
																		<sch:isERP>true</sch:isERP>
																		<xsl:if test="VGE01 and number(VGW01)!=0">
																			<sch:elapsedTimeOne>
																				<xsl:value-of select="number(VGW01)"/>
																			</sch:elapsedTimeOne>
																			<sch:elapsedTimeUnitsOne>
																				<xsl:call-template name="addTimeUnits">
																					<xsl:with-param name="erpTimeUnits" select="VGE01"/>
																				</xsl:call-template>
																			</sch:elapsedTimeUnitsOne>
																		</xsl:if>
																		<xsl:if test="VGE02 and number(VGW02)!=0">
																			<sch:elapsedTimeTwo>
																				<xsl:value-of select="number(VGW02)"/>
																			</sch:elapsedTimeTwo>
																			<sch:elapsedTimeUnitsTwo>
																				<xsl:call-template name="addTimeUnits">
																					<xsl:with-param name="erpTimeUnits" select="VGE02"/>
																				</xsl:call-template>
																			</sch:elapsedTimeUnitsTwo>
																		</xsl:if>
																		<xsl:if test="VGE03 and number(VGW03)!=0">
																			<sch:elapsedTimeThree>
																				<xsl:value-of select="number(VGW03)"/>
																			</sch:elapsedTimeThree>
																			<sch:elapsedTimeUnitsThree>
																				<xsl:call-template name="addTimeUnits">
																					<xsl:with-param name="erpTimeUnits" select="VGE03"/>
																				</xsl:call-template>
																			</sch:elapsedTimeUnitsThree>
																		</xsl:if>
																		<xsl:if test="VGE04 and number(VGW04)!=0">
																			<sch:elapsedTimeFour>
																				<xsl:value-of select="number(VGW04)"/>
																			</sch:elapsedTimeFour>
																			<sch:elapsedTimeUnitsFour>
																				<xsl:call-template name="addTimeUnits">
																					<xsl:with-param name="erpTimeUnits" select="VGE04"/>
																				</xsl:call-template>
																			</sch:elapsedTimeUnitsFour>
																		</xsl:if>
																		<xsl:if test="VGE05 and number(VGW05)!=0">
																			<sch:elapsedTimeFive>
																				<xsl:value-of select="number(VGW05)"/>
																			</sch:elapsedTimeFive>
																			<sch:elapsedTimeUnitsFive>
																				<xsl:call-template name="addTimeUnits">
																					<xsl:with-param name="erpTimeUnits" select="VGE05"/>
																				</xsl:call-template>
																			</sch:elapsedTimeUnitsFive>
																		</xsl:if>
																		<xsl:if test="VGE06 and number(VGW06)!=0">
																			<sch:elapsedTimeSix>
																				<xsl:value-of select="number(VGW06)"/>
																			</sch:elapsedTimeSix>
																			<sch:elapsedTimeUnitsSix>
																				<xsl:call-template name="addTimeUnits">
																					<xsl:with-param name="erpTimeUnits" select="VGE06"/>
																				</xsl:call-template>
																			</sch:elapsedTimeUnitsSix>
																		</xsl:if>
																	</sch:ScheduleStandardDetail>
																</xsl:if>
															</xsl:for-each>
														</xsl:for-each>
													</xsl:if>
												</xsl:for-each>
											</sch:ScheduleStandardDetailList>
										</meint:ErpScheduleStandardIn>
									</xsl:if>
									<meint:ErpControlKeyListIn>
										<xsl:for-each select="IDOC/E1AFKOL/E1AFFLL">
											<xsl:sort select="PLNFL"/>
											<xsl:if test="FLGAT = 0">
												<xsl:for-each select="E1AFVOL[E1JSTVL[last()]/STAT!='I0013']">
													<meint:ControlKeyIn>
														<sch:SiteRef>
															<meint:Site>
																<xsl:value-of select="$site"/>
															</meint:Site>
														</sch:SiteRef>
														<meint:ControlKey>
															<xsl:value-of select="STEUS"/>
														</meint:ControlKey>
														<xsl:choose>
															<xsl:when test="RUEK = '0'">
																<meint:Confirmation>P</meint:Confirmation>
															</xsl:when>
															<xsl:when test="RUEK= '1'">
																<meint:Confirmation>M</meint:Confirmation>
															</xsl:when>
															<xsl:when test="RUEK= '2'">
																<meint:Confirmation>R</meint:Confirmation>
															</xsl:when>
															<xsl:when test="RUEK= '3'">
																<meint:Confirmation>N</meint:Confirmation>
															</xsl:when>
															<xsl:otherwise>
																<meint:Confirmation>P</meint:Confirmation>
															</xsl:otherwise>
														</xsl:choose>
													</meint:ControlKeyIn>
												</xsl:for-each>
											</xsl:if>
											<xsl:if test="FLGAT != 0">
												<xsl:message terminate="yes">Only SAP Standard Routers are supported. </xsl:message>
											</xsl:if>
										</xsl:for-each>
									</meint:ErpControlKeyListIn>
								</meint:Routing>
							</xsl:if>
						</xsl:if>
						<!--
                        <sch:ShopOrderReleaseInfo>
                            <sch:Release>all</sch:Release>
                        </sch:ShopOrderReleaseInfo>
                        -->
						<!-- Customer -->
						<xsl:if test="IDOC/E1AFKOL/E1AFPOL[POSNR='0001']/KUNAG != '' and IDOC/E1AFKOL/E1AFPOL[POSNR='0001']/NAME1 != ''">
							<meint:ErpCustomerIn>
								<sch:Customer>
									<sch:SiteRef>
										<sch:Site>
											<xsl:value-of select="$site"/>
										</sch:Site>
									</sch:SiteRef>
									<sch:Customer>
										<xsl:value-of select="IDOC/E1AFKOL/E1AFPOL[POSNR='0001']/KUNAG"/>
									</sch:Customer>
									<sch:CustomerName>
										<xsl:value-of select="IDOC/E1AFKOL/E1AFPOL[POSNR='0001']/NAME1"/>
									</sch:CustomerName>
								</sch:Customer>
							</meint:ErpCustomerIn>
						</xsl:if>
						<!-- Alternate Component -->
						<meint:ErpAlternateComponentListIn>
							<xsl:for-each select="IDOC/E1AFKOL/E1AFFLL/E1AFVOL/E1RESBL">
								<xsl:sort select="RSPOS"/>
								<xsl:variable name="releasedQty" select="//IDOC/E1AFKOL/BMENGE"/>
								<xsl:variable name="totalQty" select="NOMNG div $releasedQty"/>
								<xsl:variable name="phType" select="DUMPS"/>
								<xsl:if test="string(MATNR|MATNR_EXTERNAL|MATNR_LONG) and $totalQty > 0 and number(AFPOS)!=1">
									<meint:ErpAlternateComponentIn>
										<meint:Component>
											<sch:Item>
												<xsl:call-template name="addItem">
													<xsl:with-param name="item" select="MATNR"/>
													<xsl:with-param name="itemExt" select="MATNR_EXTERNAL"/>
													<xsl:with-param name="itemLong" select="MATNR_LONG"/>
												</xsl:call-template>
											</sch:Item>
											<sch:Revision>#</sch:Revision>
										</meint:Component>
										<meint:Sequence>
											<xsl:value-of select="string(number(RSPOS)*10)"/>
										</meint:Sequence>
										<meint:AlternateItemGroup>
											<xsl:value-of select="string(ALPGR)"/>
										</meint:AlternateItemGroup>
										<meint:AlternateItemRankingOrder>
											<xsl:value-of select="number(ALPRF)"/>
										</meint:AlternateItemRankingOrder>
									</meint:ErpAlternateComponentIn>
								</xsl:if>
							</xsl:for-each>
						</meint:ErpAlternateComponentListIn>
						<!-- Data Collection-->
						<meint:ErpDataCollectionGroupListIn>
							<xsl:for-each select="IDOC/E1AFKOL/E1AFFLL">
								<xsl:sort select="PLNFL"/>
								<xsl:if test="FLGAT = 0">
									<xsl:for-each select="E1AFVOL[E1JSTVL[last()]/STAT!='I0013']">
										<xsl:sort select="VORNR"/>
										<xsl:variable name="seqCounter" select="position()"/>
										<xsl:if test="E1QAMVL">
											<xsl:variable name="dcgroup">
												<xsl:value-of select="$POValue"/>-<xsl:value-of select="VORNR"/>
												
												<!--<xsl:number value="$seqCounter*10" format="1"/>-->

											</xsl:variable>
											<meint:ErpDataCollectionGroupIn>
												<meint:CollectDataAt>ANYTIME</meint:CollectDataAt>
												<meint:CollectType>SFC</meint:CollectType>
												<meint:DcGroup>
													<xsl:value-of select="$dcgroup"/>
												</meint:DcGroup>
												<meint:Revision>A</meint:Revision>
												<meint:CurrentRevision>true</meint:CurrentRevision>
												<meint:SiteRef>
													<sch:Site>
														<xsl:value-of select="$site"/>
													</sch:Site>
												</meint:SiteRef>
												<meint:Status>RELEASABLE</meint:Status>
												<meint:AuthenticationRequired>false</meint:AuthenticationRequired>
												<meint:PassFailGroup>false</meint:PassFailGroup>
												<meint:Description>
													<xsl:value-of select="$dcgroup"/>
												</meint:Description>
												<meint:CollectMethod>MANUAL_SINGLE</meint:CollectMethod>
												<meint:ErpInspection>true</meint:ErpInspection>
												<xsl:variable name="QI100">
													<xsl:for-each select="E1QAMVL">
														<xsl:variable name="SCOPE_DC_PARAM" select="floor(SCOPE)"/>
														<xsl:variable name="QTY_TO_BUILD" select="floor(//IDOC/E1AFKOL/BMENGE)"/>
														<xsl:if test="$SCOPE_DC_PARAM!=$QTY_TO_BUILD">F</xsl:if>
													</xsl:for-each>
												</xsl:variable>
												<meint:DcParameterList>
													<xsl:for-each select="E1QAMVL">
														<xsl:variable name="dcParameterSeqCounter" select="position()"/>
														<meint:DcParameters>
															<meint:ParameterName>
																<xsl:value-of select="INSPCHAR"/>
															</meint:ParameterName>
															<meint:Description>
																<xsl:value-of select="CHAR_DESCR"/>
															</meint:Description>
															<meint:Status>ENABLED</meint:Status>
															<meint:Units>
																<xsl:value-of select="MEAS_UNIT"/>
															</meint:Units>
															<xsl:choose>
																<xsl:when test="contains($QI100,'F')">
																	<meint:RequiredDataEntries>1</meint:RequiredDataEntries>
																</xsl:when>
																<xsl:otherwise>
																	<xsl:choose>
																		<xsl:when test="//SAMPLE_SIZE_ALL">
																			<xsl:choose>
																				<xsl:when test="OBLIGATORY='X'">
																					<meint:RequiredDataEntries>1</meint:RequiredDataEntries>
																				</xsl:when>
																				<xsl:otherwise>
																					<meint:OptionalDataEntries>1</meint:OptionalDataEntries>
																				</xsl:otherwise>
																			</xsl:choose>
																		</xsl:when>
																		<xsl:otherwise>
																			<meint:RequiredDataEntries>1</meint:RequiredDataEntries>
																		</xsl:otherwise>
																	</xsl:choose>
																</xsl:otherwise>
															</xsl:choose>
															<meint:InspectionSampleSize>
																<xsl:value-of select="SCOPE"/>
															</meint:InspectionSampleSize>
															<meint:TargetValue>
																<xsl:value-of select="TARGET_VAL"/>
															</meint:TargetValue>
															<meint:Sequence>
																<xsl:number value="$dcParameterSeqCounter*10" format="1"/>
															</meint:Sequence>
															<xsl:if test="CHAR_TYPE='01'">
																<meint:DataType>N</meint:DataType>
																<meint:SoftLimitCheck>true</meint:SoftLimitCheck>
																<meint:MinValue>
																	<xsl:value-of select="string(number(translate(LW_TOL_LMT, ',' , '.')))"/>
																</meint:MinValue>
																<meint:MaxValue>
																	<xsl:value-of select="string(number(translate(UP_TOL_LMT, ',' , '.')))"/>
																</meint:MaxValue>
																<meint:MinValue2>
																	<xsl:value-of select="string(number(translate(LW_PLS_LMT, ',' , '.')))"/>
																</meint:MinValue2>
																<meint:MaxValue2>
																	<xsl:value-of select="string(number(translate(UP_PLS_LMT, ',' , '.')))"/>
																</meint:MaxValue2>
															</xsl:if>
															<xsl:if test="CHAR_TYPE='02'">
																<xsl:choose>
																	<xsl:when test="SEL_SET1 != ''">
																		<meint:DataType>L</meint:DataType>
																		<meint:DataFieldRef>
																			<me:SiteRef>
																				<me:Site>
																					<xsl:value-of select="$site"/>
																				</me:Site>
																			</me:SiteRef>
																			<me:DataField>
																				<xsl:value-of select="SEL_SET1"/>
																			</me:DataField>
																		</meint:DataFieldRef>
																	</xsl:when>
																	<xsl:otherwise>
																		<meint:DataType>T</meint:DataType>
																	</xsl:otherwise>
																</xsl:choose>
															</xsl:if>
															<xsl:if test="CHAR_TYPE='03'">
																<meint:DataType>B</meint:DataType>
																<meint:BooleanZeroValue>REJECT</meint:BooleanZeroValue>
																<meint:BooleanOneValue>ACCEPT</meint:BooleanOneValue>
															</xsl:if>
															<xsl:if test="CHAR_TYPE='04'">
																<meint:DataType>N</meint:DataType>
																<meint:SoftLimitCheck>true</meint:SoftLimitCheck>
															</xsl:if>
															<meint:SingleResource>
																<xsl:value-of select="SINGLE_RES"/>
															</meint:SingleResource>
															<meint:QmCharType>
																<xsl:value-of select="CHAR_TYPE"/>
															</meint:QmCharType>
															<xsl:choose>
																<xsl:when test="FEHLREC='X'">
																	<meint:QmCritical>true</meint:QmCritical>
																</xsl:when>
																<xsl:otherwise>
																	<meint:QmCritical>false</meint:QmCritical>
																</xsl:otherwise>
															</xsl:choose>
														</meint:DcParameters>
													</xsl:for-each>
												</meint:DcParameterList>
												<meint:AttachmentList>
													<meint:DataCollectionGroupAttachmentPoint>
														<meint:ShopOrderRef>
															<sch:ShopOrder>
																<xsl:value-of select="$POValue"/>
															</sch:ShopOrder>
															<sch:SiteRef>
																<sch:Site>
																	<xsl:value-of select="$site"/>
																</sch:Site>
															</sch:SiteRef>
														</meint:ShopOrderRef>
														<meint:RouterRef>
															<sch:SiteRef>
																<sch:Site>
																	<xsl:value-of select="$site"/>
																</sch:Site>
															</sch:SiteRef>
															<sch:Router>
																<xsl:choose>
																	<xsl:when test="E1AFREF/MES_ROUTINGID">
																		<xsl:call-template name="getId">
																			<xsl:with-param name="key" select="E1AFREF/MES_ROUTINGID"/>
																		</xsl:call-template>
																	</xsl:when>
																	<xsl:otherwise>
																		<xsl:value-of select="$router"/>
																	</xsl:otherwise>
																</xsl:choose>
															</sch:Router>
															<sch:Revision>A</sch:Revision>
															<sch:RouterType>U</sch:RouterType>
														</meint:RouterRef>
														<meint:RouterStepRef>
															<sch:RouterRef>
																<sch:SiteRef>
																	<sch:Site>
																		<xsl:value-of select="$site"/>
																	</sch:Site>
																</sch:SiteRef>
																<sch:Router>
																	<xsl:choose>
																		<xsl:when test="E1AFREF/MES_ROUTINGID">
																			<xsl:call-template name="getId">
																				<xsl:with-param name="key" select="E1AFREF/MES_ROUTINGID"/>
																			</xsl:call-template>
																		</xsl:when>
																		<xsl:otherwise>
																			<xsl:value-of select="$router"/>
																		</xsl:otherwise>
																	</xsl:choose>
																</sch:Router>
																<sch:Revision>A</sch:Revision>
																<sch:RouterType>U</sch:RouterType>
															</sch:RouterRef>
															<sch:StepId>
																<xsl:choose>
																	<xsl:when test="E1AFREF/MES_STEPID">
																		<xsl:value-of select="E1AFREF/MES_STEPID"/>
																	</xsl:when>
																	<xsl:otherwise>
																		<xsl:number value="$seqCounter*10" format="1"/>
																	</xsl:otherwise>
																</xsl:choose>
															</sch:StepId>
														</meint:RouterStepRef>
													</meint:DataCollectionGroupAttachmentPoint>
												</meint:AttachmentList>
											</meint:ErpDataCollectionGroupIn>
										</xsl:if>
									</xsl:for-each>
								</xsl:if>
							</xsl:for-each>
						</meint:ErpDataCollectionGroupListIn>
						<meint:ErpWorkInstructionListIn>
							<xsl:for-each select="IDOC/E1AFKOL/E1AFDFH/E1AFDHO">
								<sch:WorkInstructionIn>
									<sch:SiteRef>
										<sch:Site>
											<xsl:value-of select="$site"/>
										</sch:Site>
									</sch:SiteRef>
									<sch:WorkInstruction>
										<xsl:call-template name="addWorkInstructionName">
											<xsl:with-param name="docName" select="../DOKNR"/>
											<xsl:with-param name="docType" select="../DOKAR"/>
											<xsl:with-param name="docPart" select="../DOKTL"/>
											<xsl:with-param name="docOriginal" select="ORIGINAL"/>
										</xsl:call-template>
									</sch:WorkInstruction>
									<sch:Revision>
										<xsl:value-of select="../DOKVR"/>
									</sch:Revision>
									<sch:ErpFilename>
										<xsl:value-of select="FILENAME"/>
									</sch:ErpFilename>
									<sch:Url>
										<xsl:value-of select="URL"/>
									</sch:Url>
									<xsl:choose>
										<xsl:when test="string(DESCRIPTION)!=''">
											<sch:Description>
												<xsl:value-of select="DESCRIPTION"/>
											</sch:Description>
										</xsl:when>
										<xsl:otherwise>
											<sch:Description>
												<xsl:value-of select="../DKTXT"/>
											</sch:Description>
										</xsl:otherwise>
									</xsl:choose>
									<sch:StatusRef>
										<sch:Status>201</sch:Status>
									</sch:StatusRef>
									<sch:Required>true</sch:Required>
									<sch:CurrentRevision>true</sch:CurrentRevision>
									<sch:TrackViewing>false</sch:TrackViewing>
									<sch:ChangeAlert>false</sch:ChangeAlert>
									<sch:NewWindow>false</sch:NewWindow>
									<sch:SimpleInstruction>false</sch:SimpleInstruction>
									<sch:AttachmentList>
										<sch:WorkInstructionAttachmentPoint>
											<sch:ShopOrderRef>
												<sch:ShopOrder>
													<xsl:value-of select="$POValue"/>
												</sch:ShopOrder>
												<sch:SiteRef>
													<sch:Site>
														<xsl:value-of select="$site"/>
													</sch:Site>
												</sch:SiteRef>
											</sch:ShopOrderRef>
										</sch:WorkInstructionAttachmentPoint>
									</sch:AttachmentList>
								</sch:WorkInstructionIn>
							</xsl:for-each>
							<xsl:for-each select="IDOC/E1AFKOL/E1AFFLL/E1AFVOL">
								<xsl:variable name="stepIdCounter" select="position()"/>
								<xsl:for-each select="E1AFDFO/E1AFDOO">
									<sch:WorkInstructionIn>
										<sch:SiteRef>
											<sch:Site>
												<xsl:value-of select="$site"/>
											</sch:Site>
										</sch:SiteRef>
										<sch:WorkInstruction>
											<xsl:call-template name="addWorkInstructionName">
												<xsl:with-param name="docName" select="../DOKNR"/>
												<xsl:with-param name="docType" select="../DOKAR"/>
												<xsl:with-param name="docPart" select="../DOKTL"/>
												<xsl:with-param name="docOriginal" select="ORIGINAL"/>
											</xsl:call-template>
										</sch:WorkInstruction>
										<sch:Revision>
											<xsl:value-of select="../DOKVR"/>
										</sch:Revision>
										<sch:ErpFilename>
											<xsl:value-of select="FILENAME"/>
										</sch:ErpFilename>
										<sch:Url>
											<xsl:value-of select="URL"/>
										</sch:Url>
										<xsl:choose>
											<xsl:when test="string(DESCRIPTION)!=''">
												<sch:Description>
													<xsl:value-of select="DESCRIPTION"/>
												</sch:Description>
											</xsl:when>
											<xsl:otherwise>
												<sch:Description>
													<xsl:value-of select="../DKTXT"/>
												</sch:Description>
											</xsl:otherwise>
										</xsl:choose>
										<sch:StatusRef>
											<sch:Status>201</sch:Status>
										</sch:StatusRef>
										<sch:Required>true</sch:Required>
										<sch:CurrentRevision>true</sch:CurrentRevision>
										<sch:TrackViewing>false</sch:TrackViewing>
										<sch:ChangeAlert>false</sch:ChangeAlert>
										<sch:NewWindow>false</sch:NewWindow>
										<sch:SimpleInstruction>false</sch:SimpleInstruction>
										<sch:AttachmentList>
											<sch:WorkInstructionAttachmentPoint>
												<sch:ShopOrderRef>
													<sch:ShopOrder>
														<xsl:value-of select="$POValue"/>
													</sch:ShopOrder>
													<sch:SiteRef>
														<sch:Site>
															<xsl:value-of select="$site"/>
														</sch:Site>
													</sch:SiteRef>
												</sch:ShopOrderRef>
												<xsl:choose>
													<xsl:when test="../RSPOS">
														<sch:BomComponentRef>
															<sch:BomRef>
																<sch:Bom>
																	<xsl:value-of select="$POValue"/>
																</sch:Bom>
																<sch:BomType>H</sch:BomType>
															</sch:BomRef>
															<sch:Component>
																<sch:Item>
																	<xsl:call-template name="addItem">
																		<xsl:with-param name="item" select="/*/IDOC/E1AFKOL/E1AFFLL/E1AFVOL/E1RESBL[RSPOS=current()/../RSPOS]/MATNR"/>
																		<xsl:with-param name="itemExt" select="/*/IDOC/E1AFKOL/E1AFFLL/E1AFVOL/E1RESBL[RSPOS=current()/../RSPOS]/MATNR_EXTERNAL"/>
																		<xsl:with-param name="itemLong" select="/*/IDOC/E1AFKOL/E1AFFLL/E1AFVOL/E1RESBL[RSPOS=current()/../RSPOS]/MATNR_LONG"/>
																	</xsl:call-template>
																</sch:Item>
																<sch:Revision>#</sch:Revision>
															</sch:Component>
															<sch:Sequence>
																<xsl:value-of select="string(number(../RSPOS)*10)"/>
															</sch:Sequence>
														</sch:BomComponentRef>
														<sch:ErpBomComponentSequence>
															<xsl:value-of select="number(/*/IDOC/E1AFKOL/E1AFFLL/E1AFVOL/E1RESBL[RSPOS=current()/../RSPOS]/POSNR)"/>
														</sch:ErpBomComponentSequence>
													</xsl:when>
													<xsl:otherwise>
														<sch:RouterRef>
															<sch:SiteRef>
																<sch:Site>
																	<xsl:value-of select="$site"/>
																</sch:Site>
															</sch:SiteRef>
															<sch:Router>
																<xsl:choose>
																	<xsl:when test="../../E1AFREF/MES_ROUTINGID">
																		<xsl:call-template name="getId">
																			<xsl:with-param name="key" select="../../E1AFREF/MES_ROUTINGID"/>
																		</xsl:call-template>
																	</xsl:when>
																	<xsl:otherwise>
																		<xsl:value-of select="$router"/>
																	</xsl:otherwise>
																</xsl:choose>
															</sch:Router>
															<sch:Revision>A</sch:Revision>
															<sch:RouterType>U</sch:RouterType>
														</sch:RouterRef>
														<sch:RouterStepRef>
															<sch:StepId>
																<xsl:choose>
																	<xsl:when test="../../E1AFREF/MES_STEPID">
																		<xsl:value-of select="../../E1AFREF/MES_STEPID"/>
																	</xsl:when>
																	<xsl:otherwise>
																		<xsl:number value="$stepIdCounter*10" format="1"/>
																	</xsl:otherwise>
																</xsl:choose>
															</sch:StepId>
															<sch:RouterRef>
																<sch:SiteRef>
																	<sch:Site>
																		<xsl:value-of select="$site"/>
																	</sch:Site>
																</sch:SiteRef>
																<sch:Router>
																	<xsl:choose>
																		<xsl:when test="../../E1AFREF/MES_ROUTINGID">
																			<xsl:call-template name="getId">
																				<xsl:with-param name="key" select="../../E1AFREF/MES_ROUTINGID"/>
																			</xsl:call-template>
																		</xsl:when>
																		<xsl:otherwise>
																			<xsl:value-of select="$router"/>
																		</xsl:otherwise>
																	</xsl:choose>
																</sch:Router>
																<sch:Revision>A</sch:Revision>
																<sch:RouterType>U</sch:RouterType>
															</sch:RouterRef>
														</sch:RouterStepRef>
													</xsl:otherwise>
												</xsl:choose>
											</sch:WorkInstructionAttachmentPoint>
										</sch:AttachmentList>
									</sch:WorkInstructionIn>
								</xsl:for-each>
								<xsl:for-each select="E1AFDOC/E1AFDPO">
									<sch:WorkInstructionIn>
										<sch:SiteRef>
											<sch:Site>
												<xsl:value-of select="$site"/>
											</sch:Site>
										</sch:SiteRef>
										<sch:WorkInstruction>
											<xsl:call-template name="addWorkInstructionName">
												<xsl:with-param name="docName" select="../DOKNR"/>
												<xsl:with-param name="docType" select="../DOKAR"/>
												<xsl:with-param name="docPart" select="../DOKTL"/>
												<xsl:with-param name="docOriginal" select="ORIGINAL"/>
											</xsl:call-template>
										</sch:WorkInstruction>
										<sch:Revision>
											<xsl:value-of select="../DOKVR"/>
										</sch:Revision>
										<sch:ErpFilename>
											<xsl:value-of select="FILENAME"/>
										</sch:ErpFilename>
										<sch:Url>
											<xsl:value-of select="URL"/>
										</sch:Url>
										<xsl:choose>
											<xsl:when test="string(DESCRIPTION)!=''">
												<sch:Description>
													<xsl:value-of select="DESCRIPTION"/>
												</sch:Description>
											</xsl:when>
											<xsl:otherwise>
												<sch:Description>
													<xsl:value-of select="../FHKTX"/>
												</sch:Description>
											</xsl:otherwise>
										</xsl:choose>
										<sch:StatusRef>
											<sch:Status>201</sch:Status>
										</sch:StatusRef>
										<sch:Required>true</sch:Required>
										<sch:CurrentRevision>true</sch:CurrentRevision>
										<sch:TrackViewing>false</sch:TrackViewing>
										<sch:ChangeAlert>false</sch:ChangeAlert>
										<sch:NewWindow>false</sch:NewWindow>
										<sch:SimpleInstruction>false</sch:SimpleInstruction>
										<sch:AttachmentList>
											<sch:WorkInstructionAttachmentPoint>
												<sch:ShopOrderRef>
													<sch:ShopOrder>
														<xsl:value-of select="$POValue"/>
													</sch:ShopOrder>
													<sch:SiteRef>
														<sch:Site>
															<xsl:value-of select="$site"/>
														</sch:Site>
													</sch:SiteRef>
												</sch:ShopOrderRef>
												<sch:RouterRef>
													<sch:SiteRef>
														<sch:Site>
															<xsl:value-of select="$site"/>
														</sch:Site>
													</sch:SiteRef>
													<sch:Router>
														<xsl:choose>
															<xsl:when test="../../E1AFREF/MES_ROUTINGID">
																<xsl:call-template name="getId">
																	<xsl:with-param name="key" select="../../E1AFREF/MES_ROUTINGID"/>
																</xsl:call-template>
															</xsl:when>
															<xsl:otherwise>
																<xsl:value-of select="$router"/>
															</xsl:otherwise>
														</xsl:choose>
													</sch:Router>
													<sch:Revision>A</sch:Revision>
													<sch:RouterType>U</sch:RouterType>
												</sch:RouterRef>
												<sch:RouterStepRef>
													<sch:StepId>
														<xsl:choose>
															<xsl:when test="../../E1AFREF/MES_STEPID">
																<xsl:value-of select="../../E1AFREF/MES_STEPID"/>
															</xsl:when>
															<xsl:otherwise>
																<xsl:number value="$stepIdCounter*10" format="1"/>
															</xsl:otherwise>
														</xsl:choose>
													</sch:StepId>
													<sch:RouterRef>
														<sch:SiteRef>
															<sch:Site>
																<xsl:value-of select="$site"/>
															</sch:Site>
														</sch:SiteRef>
														<sch:Router>
															<xsl:choose>
																<xsl:when test="../../E1AFREF/MES_ROUTINGID">
																	<xsl:call-template name="getId">
																		<xsl:with-param name="key" select="../../E1AFREF/MES_ROUTINGID"/>
																	</xsl:call-template>
																</xsl:when>
																<xsl:otherwise>
																	<xsl:value-of select="$router"/>
																</xsl:otherwise>
															</xsl:choose>
														</sch:Router>
														<sch:Revision>A</sch:Revision>
														<sch:RouterType>U</sch:RouterType>
													</sch:RouterRef>
												</sch:RouterStepRef>
											</sch:WorkInstructionAttachmentPoint>
										</sch:AttachmentList>
									</sch:WorkInstructionIn>
								</xsl:for-each>
							</xsl:for-each>
						</meint:ErpWorkInstructionListIn>
						<xsl:for-each select="IDOC/E1AFKOL/E1AFPOL[POSNR='0001']">
							<xsl:choose>
								<xsl:when test="KDAUF!=''">
									<meint:erpOrderType>MAKE_TO_ORDER</meint:erpOrderType>
								</xsl:when>
								<xsl:otherwise>
									<meint:erpOrderType>MAKE_TO_STOCK</meint:erpOrderType>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:for-each>
					</meint:ProductionOrder>
				</meint:ProductionOrderUpdateRequest_sync>
			</soapenv:Body>
		</soapenv:Envelope>
	</xsl:template>
	<xsl:template name="addWorkInstructionName">
		<xsl:param name="docName"/>
		<xsl:param name="docType"/>
		<xsl:param name="docPart"/>
		<xsl:param name="docOriginal"/>
		<xsl:variable name="itemNumber" select="string(number($docName))"/>
		<xsl:choose>
			<xsl:when test="$itemNumber='NaN'">
				<xsl:value-of select="$docName"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$itemNumber"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:value-of select="concat('-', $docType,'-',  $docPart,'-', $docOriginal)"/>
	</xsl:template>
	<xsl:template name="addItem">
		<xsl:param name="item"/>
		<xsl:param name="itemExt"/>
		<xsl:param name="itemLong"/>
		<xsl:variable name="itemString">
			<xsl:choose>
				<xsl:when test="$itemExt!=''">
					<xsl:value-of select="normalize-space($itemExt)"/>
				</xsl:when>
				<xsl:when test="$itemLong!=''">
					<xsl:value-of select="normalize-space($itemLong)"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="normalize-space($item)"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="itemMask">
			<xsl:choose>
				<xsl:when test="$itemExt!=''">
					<xsl:value-of select="'0'"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="'0'"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="itemNumber" select="string(number($itemString))"/>
		<xsl:choose>
			<xsl:when test="$itemNumber='NaN'">
				<xsl:value-of select="$itemString"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="format-number($itemNumber, $itemMask)"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="addBOMName">
		<xsl:param name="item"/>
		<xsl:param name="itemExt"/>
		<xsl:param name="itemLong"/>
		<xsl:param name="usage"/>
		<xsl:param name="altBOM"/>
		<xsl:variable name="itemString">
			<xsl:call-template name="addItem">
				<xsl:with-param name="item" select="$item"/>
				<xsl:with-param name="itemExt" select="$itemExt"/>
				<xsl:with-param name="itemLong" select="$itemLong"/>
			</xsl:call-template>
		</xsl:variable>
		<xsl:value-of select="concat($itemString,'-', $usage, '-', number($altBOM))"/>
	</xsl:template>
	<xsl:template name="addShopOrder">
		<xsl:param name="shopOrder"/>
		<xsl:variable name="shopOrderString" select="normalize-space($shopOrder)"/>
		<xsl:variable name="shopOrderNumber" select="format-number(number($shopOrderString), '#')"/>
		<xsl:choose>
			<xsl:when test="$shopOrderNumber='NaN'">
				<xsl:value-of select="$shopOrderString"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$shopOrderNumber"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="trimItemLeadingZeros">
		<xsl:param name="item"/>
		<xsl:param name="itemExt"/>
		<xsl:param name="itemLong"/>
		<xsl:variable name="itemString">
			<xsl:choose>
				<xsl:when test="$itemExt!=''">
					<xsl:value-of select="normalize-space($itemExt)"/>
				</xsl:when>
				<xsl:when test="$itemLong!=''">
					<xsl:value-of select="normalize-space($itemLong)"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="normalize-space($item)"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="itemNumber" select="string(number($itemString))"/>
		<xsl:choose>
			<xsl:when test="$itemNumber='NaN'">
				<xsl:value-of select="$itemString"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$itemNumber"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="getId">
		<xsl:param name="key"/>
		<xsl:value-of select="substring-before(substring-after($key,'?'),'?')"/>
	</xsl:template>
	<xsl:template name="getRevision">
		<xsl:param name="key"/>
		<xsl:value-of select="substring-after(substring-after(substring-after($key,'?'),'?'),'?')"/>
	</xsl:template>

		<sch:BomRefDes>
			<sch:RefDes>2</sch:RefDes>
			<sch:Sequence>
				<xsl:number value="10"/>
			</sch:Sequence>
			<sch:Quantity>1</sch:Quantity>
		</sch:BomRefDes>

	<xsl:template name="addTimeUnits">
		<xsl:param name="erpTimeUnits"/>
		<xsl:choose>
			<xsl:when test="$erpTimeUnits ='HUR'">H</xsl:when>
			<xsl:when test="$erpTimeUnits ='MIN'">M</xsl:when>
			<xsl:when test="$erpTimeUnits ='SEC'">S</xsl:when>
<xsl:when test="$erpTimeUnits ='H'">H</xsl:when>
            <xsl:when test="$erpTimeUnits ='KWH'">M</xsl:when>
              <xsl:when test="$erpTimeUnits ='TNE'">M</xsl:when>
<xsl:when test="$erpTimeUnits ='2X'">H</xsl:when>
<xsl:when test="$erpTimeUnits ='P1'">H</xsl:when>
		</xsl:choose>
	</xsl:template>
</xsl:stylesheet>