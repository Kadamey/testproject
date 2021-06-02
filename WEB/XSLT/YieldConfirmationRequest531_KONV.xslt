<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

    <xsl:template match="/">
        <BAPI_PRODORDCONF_CREATE_TT >
            <xsl:for-each select="yieldConfirmationRequest531_KONV/item">
                <item>
                    <site>
                        <xsl:value-of select="SITE"/>
                    </site>
                    <shopOrderNo>
                        <xsl:value-of select="SHOP_ORDER"/>
                    </shopOrderNo>
                    <quantity531>
                        <xsl:value-of select="QTY"/>
                    </quantity531>
                    <operation>
                        <xsl:value-of select="OPERATION"/>
                    </operation>
    <sfcNo>
                        <xsl:value-of select="SFC"/>
                    </sfcNo>
                    <dateTime>
                        <xsl:value-of select="DATETIME"/>
                    </dateTime>
                    <user>
                        <xsl:value-of select="USER"/>
                    </user>

                </item>
            </xsl:for-each>
        </BAPI_PRODORDCONF_CREATE_TT >

    </xsl:template>
</xsl:stylesheet>
