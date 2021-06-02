<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

    <xsl:template match="/">
        <BAPI_PRODORDCONF_CREATE_TT >
            <xsl:for-each select="yieldConfirmationRequest_KM/root/element">
                <item>
                    <site>
                        <xsl:value-of select="Site"/>
                    </site>

                    <tamponStartTimeId>
                        <xsl:value-of select="tamponStartTimeId"/>
                    </tamponStartTimeId>
                    <tamponWeightId>
                        <xsl:value-of select="tamponWeightId"/>
                    </tamponWeightId>
                    <machineSpeedId>
                        <xsl:value-of select="machineSpeedId"/>
                    </machineSpeedId>
                    <qualityScraptTypeId>
                        <xsl:value-of select="qualityScraptTypeId"/>
                    </qualityScraptTypeId>
                    <raspaChangeId>
                        <xsl:value-of select="raspaChangeId"/>
                    </raspaChangeId>

                    <raspaTypeId>
                        <xsl:value-of select="raspaTypeId"/>
                    </raspaTypeId>
                    <barcodePrintCheckBoxId>
                        <xsl:value-of select="barcodePrintCheckBoxId"/>
                    </barcodePrintCheckBoxId>
                    <tamponEndTimeId>
                        <xsl:value-of select="tamponEndTimeId"/>
                    </tamponEndTimeId>
                    <productionChangeScraptId>
                        <xsl:value-of select="productionChangeScraptId"/>
                    </productionChangeScraptId>

                
                    <qualityScraptId>
                        <xsl:value-of select="qualityScraptId"/>
                    </qualityScraptId>
                    <wastedTimeId>
                        <xsl:value-of select="wastedTimeId"/>
                    </wastedTimeId>
                    <lengthId>
                        <xsl:value-of select="lengthId"/>
                    </lengthId>

                    <raspaAngleId>
                        <xsl:value-of select="raspaAngleId"/>
                    </raspaAngleId>
                    <controlUsageQUantityId>
                        <xsl:value-of select="controlUsageQUantityId"/>
                    </controlUsageQUantityId>
                    <milIndicatorCheckboxId>
                        <xsl:value-of select="milIndicatorCheckboxId"/>
                    </milIndicatorCheckboxId>

                    <orderNoField>
                        <xsl:value-of select="orderNoField"/>
                    </orderNoField>
                    <sfcNoField>
                        <xsl:value-of select="sfcNoField"/>
                    </sfcNoField>
                    <sfcStatusField>
                        <xsl:value-of select="sfcStatusField"/>
                    </sfcStatusField>

                    <splittedSfcId>
                        <xsl:value-of select="sendERPDatas/splittedSfcId"/>
                    </splittedSfcId>
                    
<total101Quantity>
                        <xsl:value-of select="sendERPDatas/quantity101"/>
                    </total101Quantity>

<total531Quantity>
                        <xsl:value-of select="sendERPDatas/quantity531"/>
                    </total531Quantity>

                    <totalTrimQuantity>
                        <xsl:value-of select="sendERPDatas/quantity531Trim"/>
                    </totalTrimQuantity>
                </item>
            </xsl:for-each>
        </BAPI_PRODORDCONF_CREATE_TT >

    </xsl:template>



</xsl:stylesheet>
