<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sch="http://sap.com/xi/ME" xmlns:me="http://sap.com/xi/ME" xmlns:meint="http://sap.com/xi/MEINT" xmlns:gdt="http://sap.com/xi/SAPGlobal/GDT">
	<xsl:template match="/LOIROU04">
		<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
			<soapenv:Header/>
			<soapenv:Body>
				<meint:RouterUpdateRequest_sync>
					<xsl:variable name="site" select="IDOC/E1MAPLL/WERKS"/>
					<xsl:variable name="router" select="concat(IDOC/E1MAPLL/PLNNR,'-',IDOC/E1MAPLL/E1MAPAL/PLNAL)"/>
					<xsl:variable name="processEngineeringChangeManagement" select="IDOC/ECM/PROCESS_ECM"/>
					<xsl:variable name="skipInvalidBomComponent" select="IDOC/SKIP_INVALID_COMPONENT"/>
					<meint:Origin>E</meint:Origin>
					<xsl:choose>
						<xsl:when test="$processEngineeringChangeManagement='true'">
							<meint:RoutingList>
								<xsl:for-each select="IDOC/ECM/VALIDITY_DATES">
									<xsl:variable name="validityFrom" select="DATUV"/>
									<xsl:variable name="validityTo" select="DATUB"/>
									<meint:Routing>
										<sch:SiteRef>
											<sch:Site>
												<xsl:value-of select="$site"/>
											</sch:Site>
										</sch:SiteRef>
										<sch:RouterIn>
											<sch:SiteRef>
												<sch:Site>
													<xsl:value-of select="$site"/>
												</sch:Site>
											</sch:SiteRef>
											<sch:Item>
												<xsl:value-of select="//IDOC/E1MAPLL/MATNR"/>
											</sch:Item>
											<sch:ErpBom>
												<xsl:variable name="erpBom">
													<xsl:choose>
														<xsl:when test="//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/E1PLPOL[$validityFrom &gt;= DATUV and $validityTo &lt;= DATUB]/E1PLMZL/STLST">
															<xsl:value-of select="//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/E1PLPOL[$validityFrom &gt;= DATUV and $validityTo &lt;= DATUB]/E1PLMZL[STLST='00']/STLNR"/>
														</xsl:when>
														<xsl:otherwise>
															<xsl:value-of select="//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/E1PLPOL[$validityFrom &gt;= DATUV and $validityTo &lt;= DATUB]/E1PLMZL/STLNR"/>
														</xsl:otherwise>
													</xsl:choose>
												</xsl:variable>
												<xsl:value-of select="$erpBom"/>
											</sch:ErpBom>
											<xsl:variable name="materialNumber">
												<xsl:call-template name="trimItemLeadingZeros">
													<xsl:with-param name="item" select="//IDOC/E1MAPLL/MATNR"/>
													<xsl:with-param name="itemExt" select="//IDOC/E1MAPLL/MATNR_EXTERNAL"/>
													<xsl:with-param name="itemLong" select="//IDOC/E1MAPLL/MATNR_LONG"/>
												</xsl:call-template>
											</xsl:variable>
											<xsl:variable name="routerDesc">
												<xsl:value-of select="substring(//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/KTEXT, 1, 20)"/>
											</xsl:variable>
											<sch:Router>
												<xsl:value-of select="$router"/>
											</sch:Router>
											<sch:RouterType>U</sch:RouterType>
											<sch:Revision>
												<xsl:value-of select="$validityFrom"/>
											</sch:Revision>
											<sch:Description>
												<xsl:call-template name="addItem">
													<xsl:with-param name="item" select="//IDOC/E1MAPLL/MATNR"/>
													<xsl:with-param name="itemExt" select="//IDOC/E1MAPLL/MATNR_EXTERNAL"/>
													<xsl:with-param name="itemLong" select="//IDOC/E1MAPLL/MATNR_LONG"/>
												</xsl:call-template>
											</sch:Description>
											<sch:StatusRef>
												<sch:SiteRef>
													<sch:Site>
														<xsl:value-of select="$site"/>
													</sch:Site>
												</sch:SiteRef>
												<sch:Status>201</sch:Status>
											</sch:StatusRef>
											<sch:EffectivityControl>R</sch:EffectivityControl>
											<sch:CurrentRevision>true</sch:CurrentRevision>
											<sch:TemporaryRouter>false</sch:TemporaryRouter>
											<sch:GenerateIsLastReportingStep>true</sch:GenerateIsLastReportingStep>
											<xsl:if test="$skipInvalidBomComponent ='true'">
												<sch:SkipInvalidBomComponent>true</sch:SkipInvalidBomComponent>
											</xsl:if>
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
												<xsl:for-each select="//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL">
													<xsl:sort select="PLNFL"/>
													<xsl:if test="FLGAT = 0">
														<xsl:for-each select="E1PLPOL[$validityFrom &gt;= DATUV and $validityTo &lt;= DATUB]">
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
																<sch:ErpSequence>0</sch:ErpSequence>
																<sch:ErpInternalID>
																	<xsl:value-of select="ARBID"/>
																</sch:ErpInternalID>
																<sch:QueueDecisionType>C</sch:QueueDecisionType>
																<xsl:choose>
																	<xsl:when test="$seqCounter=count(../../E1PLFLL/E1PLPOL[$validityFrom &gt;= DATUV and $validityTo &lt;= DATUB])">
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
																<sch:SelectionRuleList>
																	<xsl:for-each select="E1ODEPO">
																		<xsl:variable name="dependType" select="KNART"/>
																		<xsl:if test="$dependType='5'">
																			<sch:SelectionRuleDetail>
																				<sch:SelectionRule>
																					<xsl:value-of select="KNNAM"/>
																				</sch:SelectionRule>
																			</sch:SelectionRuleDetail>
																		</xsl:if>
																	</xsl:for-each>
																</sch:SelectionRuleList>
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
																						<xsl:value-of select="$router"/>-<xsl:value-of select="//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/PLNFL"/>-<xsl:value-of select="VORNR"/>
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
																	<xsl:for-each select="//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/E1PLPOL[$validityFrom &gt;= DATUV and $validityTo &lt;= DATUB]">
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
																<sch:RouterStepAttachmentList>
																	<xsl:for-each select="E1PLDOC/E1PLDPO">
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
																				<sch:SelectionRuleList>
																					<xsl:for-each select="../E1ODEPD">
																						<xsl:variable name="dependType" select="KNART"/>
																						<xsl:if test="$dependType='5'">
																							<sch:SelectionRuleDetail>
																								<sch:SelectionRule>
																									<xsl:value-of select="KNNAM"/>
																								</sch:SelectionRule>
																							</sch:SelectionRuleDetail>
																						</xsl:if>
																					</xsl:for-each>
																				</sch:SelectionRuleList>
																			</sch:RouterStepAttachment>
																		</xsl:if>
																	</xsl:for-each>
																</sch:RouterStepAttachmentList>
																<sch:RouterStepComponentList>
																	<xsl:choose>
																		<xsl:when test="E1PLMZL[$validityFrom &gt;= DATUV and $validityTo &lt;= DATUB]/STLST">
																			<xsl:for-each select="E1PLMZL[$validityFrom &gt;= DATUV and $validityTo &lt;= DATUB and STLST='00']">
																				<sch:RouterStepComponent>
																					<sch:ItemRef>
																						<sch:SiteRef>
																							<sch:Site>
																								<xsl:value-of select="$site"/>
																							</sch:Site>
																						</sch:SiteRef>
																						<sch:Item>
																							<xsl:value-of select="format-number(IDNRK, '000000000000000000')"/>
																						</sch:Item>
																						<sch:Revision>#</sch:Revision>
																					</sch:ItemRef>
																					<sch:ErpSequence>
																						<xsl:value-of select="number(POSNR)"/>
																					</sch:ErpSequence>
																					<sch:Quantity>
																						<xsl:value-of select="MENGE"/>
																					</sch:Quantity>
																				</sch:RouterStepComponent>
																			</xsl:for-each>
																		</xsl:when>
																		<xsl:otherwise>
																			<xsl:for-each select="E1PLMZL[$validityFrom &gt;= DATUV and $validityTo &lt;= DATUB]">
																				<sch:RouterStepComponent>
																					<sch:ItemRef>
																						<sch:SiteRef>
																							<sch:Site>
																								<xsl:value-of select="$site"/>
																							</sch:Site>
																						</sch:SiteRef>
																						<sch:Item>
																							<xsl:value-of select="format-number(IDNRK, '000000000000000000')"/>
																						</sch:Item>
																						<sch:Revision>#</sch:Revision>
																					</sch:ItemRef>
																					<sch:ErpSequence>
																						<xsl:value-of select="number(POSNR)"/>
																					</sch:ErpSequence>
																					<sch:Quantity>
																						<xsl:value-of select="MENGE"/>
																					</sch:Quantity>
																				</sch:RouterStepComponent>
																			</xsl:for-each>
																		</xsl:otherwise>
																	</xsl:choose>
																</sch:RouterStepComponentList>
																<sch:RouterSubstepList>
																	<xsl:for-each select="E1PLUPL[$validityFrom &gt;= DATUV and $validityTo &lt;= DATUB]">
																		<sch:RouterSubstep>
																			<xsl:variable name="seqSubstepCounter" select="position()"/>
																			<xsl:variable name="field1" select="//IDOC/E1MAPLL/PLNNR"/>
																			<xsl:variable name="field2" select="../../../../PLNAL"/>
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
																			<sch:SelectionRuleList>
																				<xsl:for-each select="E1ODEPS">
																					<xsl:variable name="dependType" select="KNART"/>
																					<xsl:if test="$dependType='5'">
																						<sch:SelectionRuleDetail>
																							<sch:SelectionRule>
																								<xsl:value-of select="KNNAM"/>
																							</sch:SelectionRule>
																						</sch:SelectionRuleDetail>
																					</xsl:if>
																				</xsl:for-each>
																			</sch:SelectionRuleList>
																		</sch:RouterSubstep>
																	</xsl:for-each>
																</sch:RouterSubstepList>
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
											<xsl:variable name="lotSizeFrom" select="//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL[FLGAT='0']/LOSVN"/>
											<xsl:variable name="lotSizeTo" select="//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL[FLGAT='0']/LOSBS"/>
											<sch:EffectiveStartDate>
												<xsl:value-of select="concat(substring($validityFrom, 1, 4), '-', substring($validityFrom, 5, 2), '-', substring($validityFrom, 7, 2), 'T00:00:01')"/>
											</sch:EffectiveStartDate>
											<sch:EffectiveEndDate>
												<xsl:value-of select="concat(substring($validityTo, 1, 4), '-', substring($validityTo, 5, 2), '-', substring($validityTo, 7, 2), 'T00:00:01')"/>
											</sch:EffectiveEndDate>
											<sch:CustomFieldList>
												<sch:CustomField>
													<sch:Attribute>ERP_MATERIAL</sch:Attribute>
													<sch:Value>
														<xsl:call-template name="addItem">
															<xsl:with-param name="item" select="//IDOC/E1MAPLL/MATNR"/>
															<xsl:with-param name="itemExt" select="//IDOC/E1MAPLL/MATNR_EXTERNAL"/>
															<xsl:with-param name="itemLong" select="//IDOC/E1MAPLL/MATNR_LONG"/>
														</xsl:call-template>
													</sch:Value>
												</sch:CustomField>
												<sch:CustomField>
													<sch:Attribute>ERP_VALIDITY_FROM</sch:Attribute>
													<sch:Value>
														<xsl:value-of select="$validityFrom"/>
													</sch:Value>
												</sch:CustomField>
												<sch:CustomField>
													<sch:Attribute>ERP_VALIDITY_TO</sch:Attribute>
													<sch:Value>
														<xsl:value-of select="$validityTo"/>
													</sch:Value>
												</sch:CustomField>
												<sch:CustomField>
													<sch:Attribute>ERP_LOT_SIZE_FROM</sch:Attribute>
													<sch:Value>
														<xsl:value-of select="$lotSizeFrom"/>
													</sch:Value>
												</sch:CustomField>
												<sch:CustomField>
													<sch:Attribute>ERP_LOT_SIZE_TO</sch:Attribute>
													<sch:Value>
														<xsl:value-of select="$lotSizeTo"/>
													</sch:Value>
												</sch:CustomField>
											</sch:CustomFieldList>
										</sch:RouterIn>
										<sch:OperationListIn>
											<xsl:for-each select="//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL">
												<xsl:if test="FLGAT = 0">
													<xsl:for-each select="E1PLPOL[$validityFrom &gt;= DATUV and $validityTo &lt;= DATUB]">
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
																		<xsl:value-of select="$router"/>-<xsl:value-of select="//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/PLNFL"/>-<xsl:value-of select="VORNR"/>
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
										<meint:ErpSubstepListIn>
											<xsl:variable name="substepList"/>
											<xsl:for-each select="//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/E1PLPOL[$validityFrom &gt;= DATUV and $validityTo &lt;= DATUB]/E1PLUPL/UVORN">
												<xsl:variable name="lastSubstepList" select="$substepList"/>
												<xsl:variable name="erpSeqSubstepCounter" select="position()"/>
												<xsl:variable name="field1" select="//IDOC/E1MAPLL/PLNNR"/>
												<xsl:variable name="field2" select="../../../../../PLNAL"/>
												<xsl:variable name="field3" select="../../../PLNFL"/>
												<xsl:variable name="field4" select="../../VORNR"/>
												<xsl:variable name="field5" select="."/>
												<xsl:variable name="substep">
													<xsl:choose>
														<xsl:when test="../ME_OPERATION_ID">
															<xsl:value-of select="../ME_OPERATION_ID"/>
														</xsl:when>
														<xsl:when test="../../ME_OPERATION_ID">
															<xsl:value-of select="concat(../../ME_OPERATION_ID, '-',$field5)"/>
														</xsl:when>
														<xsl:otherwise>
															<xsl:value-of select="concat($field1,'-',$field2, '-',$field3, '-',$field4, '-',$field5)"/>
														</xsl:otherwise>
													</xsl:choose>
												</xsl:variable>
												<xsl:variable name="substepRevision">
													<xsl:choose>
														<xsl:when test="../ME_OPERATION_ID">
															<xsl:choose>
																<xsl:when test="../ME_REVISION">
																	<xsl:value-of select="../ME_REVISION"/>
																</xsl:when>
																<xsl:otherwise>#</xsl:otherwise>
															</xsl:choose>
														</xsl:when>
														<xsl:otherwise>#</xsl:otherwise>
													</xsl:choose>
												</xsl:variable>
												<sch:Substep>
													<sch:SubstepRef>
														<sch:SiteRef>
															<sch:Site>
																<xsl:value-of select="$site"/>
															</sch:Site>
														</sch:SiteRef>
														<sch:Substep>
															<xsl:value-of select="$substep"/>
														</sch:Substep>
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
														<xsl:value-of select="../LTXA1"/>
													</sch:SubstepDescription>
												</sch:Substep>
											</xsl:for-each>
										</meint:ErpSubstepListIn>
										<meint:ErpWorkInstructionListIn>
											<xsl:for-each select="//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/E1PLPOL[$validityFrom &gt;= DATUV and $validityTo &lt;= DATUB]">
												<xsl:for-each select="E1PLDOC/E1PLDPO">
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
													</sch:WorkInstructionIn>
												</xsl:for-each>
											</xsl:for-each>
										</meint:ErpWorkInstructionListIn>
										<xsl:if test="//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/E1PLPOL[$validityFrom &gt;= DATUV and $validityTo &lt;= DATUB]/*[starts-with(name(), 'VGE0')] and //IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/E1PLPOL[$validityFrom &gt;= DATUV and $validityTo &lt;= DATUB]/*[starts-with(name(), 'VGW0')]!=0">
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
															<xsl:call-template name="addItem">
																<xsl:with-param name="item" select="//IDOC/E1MAPLL/MATNR"/>
																<xsl:with-param name="itemExt" select="//IDOC/E1MAPLL/MATNR_EXTERNAL"/>
																<xsl:with-param name="itemLong" select="//IDOC/E1MAPLL/MATNR_LONG"/>
															</xsl:call-template>
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
													<xsl:for-each select="//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL">
														<xsl:sort select="PLNFL"/>
														<xsl:if test="FLGAT = 0">
															<xsl:for-each select="E1PLPOL[$validityFrom &gt;= DATUV and $validityTo &lt;= DATUB]">
																<xsl:variable name="operationSeqCounter" select="position()"/>
																<xsl:variable name="operation">
																	<xsl:choose>
																		<xsl:when test="ME_OPERATION_ID">
																			<xsl:value-of select="ME_OPERATION_ID"/>
																		</xsl:when>
																		<xsl:otherwise>
																			<xsl:value-of select="concat($router,'-',//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/PLNFL,'-',VORNR)"/>
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
																<xsl:if test="*[starts-with(name(), 'VGE0')] and *[starts-with(name(), 'VGW0')]!=0">
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
																<xsl:for-each select="E1PLUPL">
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
																	<xsl:if test="*[starts-with(name(), 'VGE0')] and *[starts-with(name(), 'VGW0')]!=0">
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
											<xsl:for-each select="//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL">
												<xsl:if test="FLGAT = 0">
													<xsl:for-each select="E1PLPOL[$validityFrom &gt;= DATUV and $validityTo &lt;= DATUB]">
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
													<xsl:message terminate="yes">
                                        Only SAP Standard Routers are supported.
                                    </xsl:message>
												</xsl:if>
											</xsl:for-each>
										</meint:ErpControlKeyListIn>
									</meint:Routing>
								</xsl:for-each>
							</meint:RoutingList>
							<meint:EngineeringChangeManagementList>
								<xsl:for-each select="IDOC/ECM/VALIDITY_DATES">
									<xsl:variable name="validityFrom" select="DATUV"/>
									<xsl:variable name="validityTo" select="DATUB"/>
									<meint:EffectiveDates>
										<meint:ValidFrom>
											<xsl:value-of select="$validityFrom"/>
										</meint:ValidFrom>
										<meint:ValidTo>
											<xsl:value-of select="$validityTo"/>
										</meint:ValidTo>
									</meint:EffectiveDates>
								</xsl:for-each>
							</meint:EngineeringChangeManagementList>
						</xsl:when>
						<xsl:otherwise>
							<meint:Routing>
								<sch:SiteRef>
									<sch:Site>
										<xsl:value-of select="$site"/>
									</sch:Site>
								</sch:SiteRef>
								<sch:RouterIn>
									<sch:SiteRef>
										<sch:Site>
											<xsl:value-of select="$site"/>
										</sch:Site>
									</sch:SiteRef>
									<sch:Item>
										<xsl:value-of select="format-number(//IDOC/E1MAPLL/MATNR, '000000000000000000')"/>
									</sch:Item>
									<sch:ErpBom>
										<xsl:variable name="erpBom">
											<xsl:choose>
												<xsl:when test="//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/E1PLPOL/E1PLMZL/STLST">
													<xsl:value-of select="//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/E1PLPOL/E1PLMZL[STLST='00']/STLNR"/>
												</xsl:when>
												<xsl:otherwise>
													<xsl:value-of select="//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/E1PLPOL/E1PLMZL/STLNR"/>
												</xsl:otherwise>
											</xsl:choose>
										</xsl:variable>
										<xsl:value-of select="$erpBom"/>
									</sch:ErpBom>
									<xsl:variable name="materialNumber">
										<xsl:call-template name="trimItemLeadingZeros">
											<xsl:with-param name="item" select="IDOC/E1MAPLL/MATNR"/>
											<xsl:with-param name="itemExt" select="IDOC/E1MAPLL/MATNR_EXTERNAL"/>
											<xsl:with-param name="itemLong" select="IDOC/E1MAPLL/MATNR_LONG"/>
										</xsl:call-template>
									</xsl:variable>
									<xsl:variable name="routerDesc">
										<xsl:value-of select="substring(IDOC/E1MAPLL/E1MAPAL/E1PLKOL/KTEXT, 1, 20)"/>
									</xsl:variable>
									<sch:Router>
										<xsl:value-of select="$router"/>
									</sch:Router>
									<sch:RouterType>U</sch:RouterType>
									<sch:Description>
										<!-- <xsl:value-of select="concat($materialNumber, ' ', $routerDesc)"/> -->
										<xsl:call-template name="addItem">
											<xsl:with-param name="item" select="IDOC/E1MAPLL/MATNR"/>
											<xsl:with-param name="itemExt" select="IDOC/E1MAPLL/MATNR_EXTERNAL"/>
											<xsl:with-param name="itemLong" select="IDOC/E1MAPLL/MATNR_LONG"/>
										</xsl:call-template>
										<!-- <xsl:value-of select="IDOC/E1MAPLL/PLNNR"/>-<xsl:value-of select="IDOC/E1MAPLL/E1MAPAL/PLNAL"/> -->
									</sch:Description>
									<sch:StatusRef>
										<sch:SiteRef>
											<sch:Site>
												<xsl:value-of select="$site"/>
											</sch:Site>
										</sch:SiteRef>
										<sch:Status>201</sch:Status>
									</sch:StatusRef>
									<sch:EffectivityControl>R</sch:EffectivityControl>
									<sch:CurrentRevision>true</sch:CurrentRevision>
									<sch:TemporaryRouter>false</sch:TemporaryRouter>
									<sch:GenerateIsLastReportingStep>true</sch:GenerateIsLastReportingStep>
									<xsl:if test="$skipInvalidBomComponent ='true'">
										<sch:SkipInvalidBomComponent>true</sch:SkipInvalidBomComponent>
									</xsl:if>
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
										<xsl:for-each select="IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL">
											<xsl:sort select="PLNFL"/>
											<xsl:if test="FLGAT = 0">
												<xsl:for-each select="E1PLPOL">
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
														<sch:ErpSequence>0</sch:ErpSequence>
														<sch:ErpInternalID>
															<xsl:value-of select="ARBID"/>
														</sch:ErpInternalID>
														<sch:QueueDecisionType>C</sch:QueueDecisionType>
														<xsl:choose>
															<xsl:when test="$seqCounter=count(../../E1PLFLL/E1PLPOL)">
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
														<sch:SelectionRuleList>
															<xsl:for-each select="E1ODEPO">
																<xsl:variable name="dependType" select="KNART"/>
																<xsl:if test="$dependType='5'">
																	<sch:SelectionRuleDetail>
																		<sch:SelectionRule>
																			<xsl:value-of select="KNNAM"/>
																		</sch:SelectionRule>
																	</sch:SelectionRuleDetail>
																</xsl:if>
															</xsl:for-each>
														</sch:SelectionRuleList>
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
																				<xsl:value-of select="$router"/>-<xsl:value-of select="//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/PLNFL"/>-<xsl:value-of select="VORNR"/>
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
															<xsl:for-each select="//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/E1PLPOL">
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
														<sch:RouterStepAttachmentList>
															<xsl:for-each select="E1PLDOC/E1PLDPO">
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
																		<sch:SelectionRuleList>
																			<xsl:for-each select="../E1ODEPD">
																				<xsl:variable name="dependType" select="KNART"/>
																				<xsl:if test="$dependType='5'">
																					<sch:SelectionRuleDetail>
																						<sch:SelectionRule>
																							<xsl:value-of select="KNNAM"/>
																						</sch:SelectionRule>
																					</sch:SelectionRuleDetail>
																				</xsl:if>
																			</xsl:for-each>
																		</sch:SelectionRuleList>
																	</sch:RouterStepAttachment>
																</xsl:if>
															</xsl:for-each>
														</sch:RouterStepAttachmentList>
														<sch:RouterStepComponentList>
															<xsl:choose>
																<xsl:when test="E1PLMZL/STLST">
																	<xsl:for-each select="E1PLMZL[STLST='00']">
																		<sch:RouterStepComponent>
																			<sch:ItemRef>
																				<sch:SiteRef>
																					<sch:Site>
																						<xsl:value-of select="$site"/>
																					</sch:Site>
																				</sch:SiteRef>
																				<sch:Item>
																					<xsl:value-of select="format-number(IDNRK, '000000000000000000')"/>
																				</sch:Item>
																				<sch:Revision>#</sch:Revision>
																			</sch:ItemRef>
																			<sch:ErpSequence>
																				<xsl:value-of select="number(POSNR)"/>
																			</sch:ErpSequence>
																			<sch:Quantity>
																				<xsl:value-of select="MENGE"/>
																			</sch:Quantity>
																		</sch:RouterStepComponent>
																	</xsl:for-each>
																</xsl:when>
																<xsl:otherwise>
																	<xsl:for-each select="E1PLMZL">
																		<sch:RouterStepComponent>
																			<sch:ItemRef>
																				<sch:SiteRef>
																					<sch:Site>
																						<xsl:value-of select="$site"/>
																					</sch:Site>
																				</sch:SiteRef>
																				<sch:Item>
																			<xsl:value-of select="format-number(IDNRK, '000000000000000000')"/>
																				</sch:Item>
																				<sch:Revision>#</sch:Revision>
																			</sch:ItemRef>
																			<sch:ErpSequence>
																				<xsl:value-of select="number(POSNR)"/>
																			</sch:ErpSequence>
																			<sch:Quantity>
																				<xsl:value-of select="MENGE"/>
																			</sch:Quantity>
																		</sch:RouterStepComponent>
																	</xsl:for-each>
																</xsl:otherwise>
															</xsl:choose>
														</sch:RouterStepComponentList>
														<sch:RouterSubstepList>
															<xsl:for-each select="E1PLUPL">
																<sch:RouterSubstep>
																	<xsl:variable name="seqSubstepCounter" select="position()"/>
																	<xsl:variable name="field1" select="//IDOC/E1MAPLL/PLNNR"/>
																	<xsl:variable name="field2" select="../../../../PLNAL"/>
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
																	<sch:SelectionRuleList>
																		<xsl:for-each select="E1ODEPS">
																			<xsl:variable name="dependType" select="KNART"/>
																			<xsl:if test="$dependType='5'">
																				<sch:SelectionRuleDetail>
																					<sch:SelectionRule>
																						<xsl:value-of select="KNNAM"/>
																					</sch:SelectionRule>
																				</sch:SelectionRuleDetail>
																			</xsl:if>
																		</xsl:for-each>
																	</sch:SelectionRuleList>
																</sch:RouterSubstep>
															</xsl:for-each>
														</sch:RouterSubstepList>
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
									<xsl:variable name="validityFrom" select="IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL[FLGAT='0']/DATUV"/>
									<xsl:variable name="validityTo" select="IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL[FLGAT='0']/DATUB"/>
									<xsl:variable name="lotSizeFrom" select="IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL[FLGAT='0']/LOSVN"/>
									<xsl:variable name="lotSizeTo" select="IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL[FLGAT='0']/LOSBS"/>
									<sch:EffectiveStartDate>
										<xsl:value-of select="concat(substring($validityFrom, 1, 4), '-', substring($validityFrom, 5, 2), '-', substring($validityFrom, 7, 2), 'T00:00:01')"/>
									</sch:EffectiveStartDate>
									<sch:EffectiveEndDate>
										<xsl:value-of select="concat(substring($validityTo, 1, 4), '-', substring($validityTo, 5, 2), '-', substring($validityTo, 7, 2), 'T00:00:01')"/>
									</sch:EffectiveEndDate>
									<sch:CustomFieldList>
										<sch:CustomField>
											<sch:Attribute>ERP_MATERIAL</sch:Attribute>
											<sch:Value>
												<xsl:call-template name="addItem">
													<xsl:with-param name="item" select="IDOC/E1MAPLL/MATNR"/>
													<xsl:with-param name="itemExt" select="IDOC/E1MAPLL/MATNR_EXTERNAL"/>
													<xsl:with-param name="itemLong" select="IDOC/E1MAPLL/MATNR_LONG"/>
												</xsl:call-template>
											</sch:Value>
										</sch:CustomField>
										<sch:CustomField>
											<sch:Attribute>ERP_VALIDITY_FROM</sch:Attribute>
											<sch:Value>
												<xsl:value-of select="$validityFrom"/>
											</sch:Value>
										</sch:CustomField>
										<sch:CustomField>
											<sch:Attribute>ERP_VALIDITY_TO</sch:Attribute>
											<sch:Value>
												<xsl:value-of select="$validityTo"/>
											</sch:Value>
										</sch:CustomField>
										<sch:CustomField>
											<sch:Attribute>ERP_LOT_SIZE_FROM</sch:Attribute>
											<sch:Value>
												<xsl:value-of select="$lotSizeFrom"/>
											</sch:Value>
										</sch:CustomField>
										<sch:CustomField>
											<sch:Attribute>ERP_LOT_SIZE_TO</sch:Attribute>
											<sch:Value>
												<xsl:value-of select="$lotSizeTo"/>
											</sch:Value>
										</sch:CustomField>
									</sch:CustomFieldList>
								</sch:RouterIn>
								<sch:OperationListIn>
									<xsl:for-each select="IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL">
										<xsl:if test="FLGAT = 0">
											<xsl:for-each select="E1PLPOL">
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
																<xsl:value-of select="$router"/>-<xsl:value-of select="//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/PLNFL"/>-<xsl:value-of select="VORNR"/>
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
                        <xsl:if test="boolean(IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/E1PLPOL/E1AFDOC)">
                            <meint:AttachmentList>
                                <xsl:for-each select="IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL">
                                    <xsl:sort select="PLNFL"/>
                                    <xsl:if test="FLGAT = 0">
                                        <xsl:for-each select="E1PLPOL">
                                            <xsl:sort select="VORNR"/>
                                            <xsl:if test="E1AFDOC">
                                                <meint:ErpAttachment>
                                                    <sch:OperationRef>
                                                        <sch:Operation><xsl:value-of select="//IDOC/E1MAPLL/PLNNR"/>-<xsl:value-of select="//IDOC/E1MAPLL/E1MAPAL/PLNAL"/>-<xsl:value-of select="//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/PLNFL"/>-<xsl:value-of select="VORNR"/></sch:Operation>
                                                        <sch:Revision>#</sch:Revision>
                                                    </sch:OperationRef>
                                                    <meint:AttachedToList>
                                                        <xsl:for-each select="E1AFDOC">
                                                            <meint:AttachedTo>
                                                                <meint:Sequence><xsl:number value="PSNFH" format="1"/></meint:Sequence>
                                                                <sch:WorkInstructionRef>
                                                                    <sch:WorkInstruction><xsl:value-of select="concat(DOKNR,'-', DOKTL, '-', DOKAR)"/></sch:WorkInstruction>
                                                                    <sch:Revision><xsl:value-of select="DOKVR"/></sch:Revision>
                                                                </sch:WorkInstructionRef>
                                                            </meint:AttachedTo>
                                                        </xsl:for-each>
                                                    </meint:AttachedToList>
                                                </meint:ErpAttachment>
                                            </xsl:if>
                                        </xsl:for-each>
                                    </xsl:if>
                                </xsl:for-each>
                            </meint:AttachmentList>
                        </xsl:if>
                         -->
								<meint:ErpSubstepListIn>
									<xsl:variable name="substepList"/>
									<xsl:for-each select="IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/E1PLPOL/E1PLUPL/UVORN">
										<xsl:variable name="lastSubstepList" select="$substepList"/>
										<xsl:variable name="erpSeqSubstepCounter" select="position()"/>
										<xsl:variable name="field1" select="//IDOC/E1MAPLL/PLNNR"/>
										<xsl:variable name="field2" select="../../../../../PLNAL"/>
										<xsl:variable name="field3" select="../../../PLNFL"/>
										<xsl:variable name="field4" select="../../VORNR"/>
										<xsl:variable name="field5" select="."/>
										<xsl:variable name="substep">
											<xsl:choose>
												<xsl:when test="../ME_OPERATION_ID">
													<xsl:value-of select="../ME_OPERATION_ID"/>
												</xsl:when>
												<xsl:when test="../../ME_OPERATION_ID">
													<xsl:value-of select="concat(../../ME_OPERATION_ID, '-',$field5)"/>
												</xsl:when>
												<xsl:otherwise>
													<xsl:value-of select="concat($field1,'-',$field2, '-',$field3, '-',$field4, '-',$field5)"/>
												</xsl:otherwise>
											</xsl:choose>
										</xsl:variable>
										<xsl:variable name="substepRevision">
											<xsl:choose>
												<xsl:when test="../ME_OPERATION_ID">
													<xsl:choose>
														<xsl:when test="../ME_REVISION">
															<xsl:value-of select="../ME_REVISION"/>
														</xsl:when>
														<xsl:otherwise>#</xsl:otherwise>
													</xsl:choose>
												</xsl:when>
												<xsl:otherwise>#</xsl:otherwise>
											</xsl:choose>
										</xsl:variable>
										<sch:Substep>
											<sch:SubstepRef>
												<sch:SiteRef>
													<sch:Site>
														<xsl:value-of select="$site"/>
													</sch:Site>
												</sch:SiteRef>
												<sch:Substep>
													<xsl:value-of select="$substep"/>
												</sch:Substep>
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
												<xsl:value-of select="../LTXA1"/>
											</sch:SubstepDescription>
										</sch:Substep>
									</xsl:for-each>
								</meint:ErpSubstepListIn>
								<meint:ErpWorkInstructionListIn>
									<xsl:for-each select="IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/E1PLPOL">
										<xsl:for-each select="E1PLDOC/E1PLDPO">
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
											</sch:WorkInstructionIn>
										</xsl:for-each>
									</xsl:for-each>
								</meint:ErpWorkInstructionListIn>
								<xsl:if test="IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/E1PLPOL/*[starts-with(name(), 'VGE0')] and IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/E1PLPOL/*[starts-with(name(), 'VGW0')]!=0">
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
													<xsl:call-template name="addItem">
														<xsl:with-param name="item" select="IDOC/E1MAPLL/MATNR"/>
														<xsl:with-param name="itemExt" select="IDOC/E1MAPLL/MATNR_EXTERNAL"/>
														<xsl:with-param name="itemLong" select="IDOC/E1MAPLL/MATNR_LONG"/>
													</xsl:call-template>
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
											<xsl:for-each select="IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL">
												<xsl:sort select="PLNFL"/>
												<xsl:if test="FLGAT = 0">
													<xsl:for-each select="E1PLPOL">
														<xsl:variable name="operationSeqCounter" select="position()"/>
														<xsl:variable name="operation">
															<xsl:choose>
																<xsl:when test="ME_OPERATION_ID">
																	<xsl:value-of select="ME_OPERATION_ID"/>
																</xsl:when>
																<xsl:otherwise>
																	<xsl:value-of select="concat($router,'-',//IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL/PLNFL,'-',VORNR)"/>
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
														<xsl:if test="*[starts-with(name(), 'VGE0')] and *[starts-with(name(), 'VGW0')]!=0">
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
														<xsl:for-each select="E1PLUPL">
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
															<xsl:if test="*[starts-with(name(), 'VGE0')] and *[starts-with(name(), 'VGW0')]!=0">
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
									<xsl:for-each select="IDOC/E1MAPLL/E1MAPAL/E1PLKOL/E1PLFLL">
										<xsl:if test="FLGAT = 0">
											<xsl:for-each select="E1PLPOL">
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
											<xsl:message terminate="yes">
                                        Only SAP Standard Routers are supported.
                                    </xsl:message>
										</xsl:if>
									</xsl:for-each>
								</meint:ErpControlKeyListIn>
							</meint:Routing>
						</xsl:otherwise>
					</xsl:choose>
				</meint:RouterUpdateRequest_sync>
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
					<xsl:value-of select="'0000000000000000000000000000000000000000'"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="'000000000000000000'"/>
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
	<xsl:template name="addTimeUnits">
		<xsl:param name="erpTimeUnits"/>
		<xsl:choose>
			<xsl:when test="$erpTimeUnits ='HUR'">H</xsl:when>
			<xsl:when test="$erpTimeUnits ='MIN'">M</xsl:when>
			<xsl:when test="$erpTimeUnits ='SEC'">S</xsl:when>
      <xsl:when test="$erpTimeUnits ='KWH'">M</xsl:when>
              <xsl:when test="$erpTimeUnits ='TNE'">M</xsl:when>
		</xsl:choose>
	</xsl:template>
</xsl:stylesheet>