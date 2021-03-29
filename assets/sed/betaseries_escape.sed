# Replace title characters for betaseries URLs
y/āáǎàäēéěèëīíǐìïōóǒòöūúǔùüǖǘǚǜĀÁǍÀĒÉĚÈĪÍǏÌŌÓǑÒŪÚǓÙǕǗǙǛ/aaaaaeeeeeiiiiiooooouuuuuüüüüAAAAEEEEIIIIOOOOUUUUÜÜÜÜ/
s/ ([0-9][0-9][0-9][0-9])//g
s/[[:blank:]]/-/g
s/-&amp;//g
s/\.//g
s/\'//g
s/\’//g
s/(//g
s/)//g
s/://g
s/&quot;//g
s/,//g
s/--/-/g
s/&//g
s/?//g
s/¿//g