<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="xml" indent="yes" omit-xml-declaration="yes"/>
<xsl:variable name="vAllowedSymbols"
select="'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÖöÇçİıŞşĞğüÜ-/\* '"/>
<xsl:template match="node() | @*">
<xsl:copy>
<xsl:apply-templates select="node() | @*"/>
</xsl:copy>
</xsl:template>
<xsl:template match="text()">
<xsl:value-of select="
translate(
.,
translate(., $vAllowedSymbols, ''),
''
)
"/>
</xsl:template>
</xsl:stylesheet>