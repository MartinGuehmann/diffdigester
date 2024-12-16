// Copyright by Martin and Ralf Mrowka (C) 2021,  all rights reserved

var enzymeArray = [];

var cutinseq1notin3Label = "cut in Sequence 1 but not in Sequence 3";
var cutinseq2notin3Label = "cut in Sequence 2 but not in Sequence 3";
var cutinseq1Label = "cut in Sequence 1";
var cutinseq2Label = "cut in Sequence 2";
var cutinseq3Label = "cut in Sequence 3";
var nocutinseq1Label = "no cut in Sequence 1";
var nocutinseq2Label = "no cut in Sequence 2";
var nocutinseq3Label = "no cut in Sequence 3";

for (i = 0; i < enzymeentry.length; i++)
{
	let rawEntry = enzymeentry[i].split('\t');

	if(!enzymeArray.some(enzyme => enzyme.name === rawEntry[0]))
	{
		var enzyme = new Object();
		enzyme.name = rawEntry[0];
		enzyme.recognition = [];
		enzyme.recognition[0] = rawEntry[1];

		cleanRecognition = clean(enzyme.recognition[0]);
		reverseComplement = revcompl(cleanRecognition);

		enzyme.regexfw = [];
		enzyme.regexrv = [];
		enzyme.regexfw[0] = makeregex(cleanRecognition);
		enzyme.regexrv[0] = makeregex(reverseComplement);

		enzyme.cutPosFw = [];
		enzyme.cutPosRv = [];

		enzyme.cutPosFw[0] = enzyme.recognition[0].indexOf("\'");
		enzyme.cutPosRv[0] = enzyme.recognition[0].indexOf("_");
		if(enzyme.cutPosRv[0] == -1)
			enzyme.cutPosRv[0] = enzyme.cutPosFw[0];
		else if(enzyme.cutPosFw[0] < enzyme.cutPosRv[0])
			enzyme.cutPosRv[0]--;
		else if(enzyme.cutPosFw[0] > enzyme.cutPosRv[0])
			enzyme.cutPosFw[0]--;

		enzyme.cutPosRv[0] = cleanRecognition.length - enzyme.cutPosRv[0];

		enzymeArray.push(enzyme);
	}
	else
	{
		let newIndex = enzyme.recognition.length;
		enzyme.recognition[newIndex] = rawEntry[1];;

		cleanRecognition = clean(enzyme.recognition[newIndex]);
		reverseComplement = revcompl(cleanRecognition);

		enzyme.regexfw[newIndex] = makeregex(cleanRecognition);
		enzyme.regexrv[newIndex] = makeregex(reverseComplement);

		enzyme.cutPosFw[newIndex] = enzyme.recognition[newIndex].indexOf("\'");
		enzyme.cutPosRv[newIndex] = enzyme.recognition[newIndex].indexOf("_");
		if(enzyme.cutPosRv[newIndex] == -1)
			enzyme.cutPosRv[newIndex] = enzyme.cutPosFw[newIndex];
		else if(enzyme.cutPosFw[newIndex] < enzyme.cutPosRv[newIndex])
			enzyme.cutPosRv[newIndex]--;
		else if(enzyme.cutPosFw[newIndex] > enzyme.cutPosRv[newIndex])
			enzyme.cutPosFw[newIndex]--;

		enzyme.cutPosRv[newIndex] = cleanRecognition.length - enzyme.cutPosRv[newIndex];
	}
}

window.onload=function()
{
	initEnzymeLists();
}

function initEnzymeLists()
{
	var enzymesToUse     = document.getElementById("EnzymesToUse");
	var enzymesToExclude = document.getElementById("EnzymesToExclude");
	for (var i in enzymeArray)
	{
		enzymesToUse    .options[i] = new Option(enzymeArray[i].name, i);
		enzymesToUse    .options[i].id = enzymeArray[i].name;
	}
}

function addInAlphabethicalOrder(optionList, itemToAdd)
{
	var i = 0;
	for(; i < optionList.length; i++)
	{
		if (optionList[i].id > itemToAdd.id)
			break;
	}

	optionList.add(itemToAdd, i);
}

function addEnzymes()
{
	var enzymesToUse     = document.getElementById("EnzymesToUse").options;
	var enzymesToExclude = document.getElementById("EnzymesToExclude").options;

	for(var i = enzymesToExclude.length - 1; i >= 0; i--)
	{
		if(enzymesToExclude[i].selected)
		{
			enzymesToExclude[i].selected = false;
			addInAlphabethicalOrder(enzymesToUse, enzymesToExclude[i]);
		}
	}

	document.getElementById("fileWarning").innerHTML = "";
}

function removeEnzymes()
{
	var enzymesToUse     = document.getElementById("EnzymesToUse").options;
	var enzymesToExclude = document.getElementById("EnzymesToExclude").options;

	for(var i = enzymesToUse.length - 1; i >= 0; i--)
	{
		if(enzymesToUse[i].selected)
		{
			enzymesToUse[i].selected = false;
			addInAlphabethicalOrder(enzymesToExclude, enzymesToUse[i]);
		}
	}

	document.getElementById("fileWarning").innerHTML = "";
}

function useAllEnzymes()
{
	var enzymesToUse     = document.getElementById("EnzymesToUse").options;
	var enzymesToExclude = document.getElementById("EnzymesToExclude").options;

	for(var i = enzymesToExclude.length - 1; i >= 0; i--)
	{
		enzymesToExclude[i].selected = false;
		addInAlphabethicalOrder(enzymesToUse, enzymesToExclude[i]);
	}

	document.getElementById("fileWarning").innerHTML = "";
}

function removeAllEnzymes()
{
	var enzymesToUse     = document.getElementById("EnzymesToUse").options;
	var enzymesToExclude = document.getElementById("EnzymesToExclude").options;

	for(var i = enzymesToUse.length - 1; i >= 0; i--)
	{
		enzymesToUse[i].selected = false;
		addInAlphabethicalOrder(enzymesToExclude, enzymesToUse[i]);
	}


	document.getElementById("fileWarning").innerHTML = "";
}

function loadEnzymes()
{
	var loadEnzymesDialog = document.getElementById("loadEnzymesDialog");
	loadEnzymesDialog.click();
}

function onChangeLoadEnzymes()
{
	var loadEnzymesDialog = document.getElementById("loadEnzymesDialog");
	var enzymeFile = loadEnzymesDialog.files[0];

	var reader = new FileReader();
	reader.onload = function(event)
	{
		var fileWarning = document.getElementById("fileWarning").innerHTML;
		fileWarning = "";
		removeAllEnzymes();

		var enzymesToUse     = document.getElementById("EnzymesToUse").options;
		var enzymesToExclude = document.getElementById("EnzymesToExclude").options;

		const file = event.target.result;
		const allLines = file.split(/\r\n|\n/);

		allLines.forEach((line) => {

			line = line.split('#')[0];
			line = line.replace(/\s/g, "");

			if(line == "")
			{
				return;
			}

			var enzymesToExcludeItem = enzymesToExclude.namedItem(line);

			if(enzymesToExcludeItem != null)
			{
				addInAlphabethicalOrder(enzymesToUse, enzymesToExcludeItem);
			}
			else if(fileWarning == "")
			{
				fileWarning = "Warning! Preselector does not know this enzyme: " +
				              line +
				              "<br>This is the first unknown enzyme in the list, which" +
				              "<br>may contain more unknown enzymes. All unknown enzymes are ignored.";
			}
		});

		document.getElementById("fileWarning").innerHTML = fileWarning;
	};

	reader.readAsText(enzymeFile);
}

function saveEnzymes()
{
	var enzymesToSaveFileBody = "data:text/txt,";
	var enzymesToUse          = document.getElementById("EnzymesToUse");

	enzymesToSaveFileBody += "# This is an enzyme list file generated by Preselector.\n";
	enzymesToSaveFileBody += "# Everything following a # is a comment.\n"
	enzymesToSaveFileBody += "# Empty lines are ignored.\n"
	enzymesToSaveFileBody += "# Tabs and spaces are ignored.\n"
	enzymesToSaveFileBody += "# Each line contains an enzyme name.\n"
	enzymesToSaveFileBody += "# Enzymes Preselector does not know are ignored.\n"
	enzymesToSaveFileBody += "# In that case Preselector reports the first unknown enzyme only.\n\n"

	for(var i = 0; i < enzymesToUse.length; i++)
	{
		enzymesToSaveFileBody += enzymesToUse[i].text;
		enzymesToSaveFileBody += "\n";
	}

	enzymesToSaveFileBody = enzymesToSaveFileBody.replace(/\n/g, "%0D%0A");
	enzymesToSaveFileBody = enzymesToSaveFileBody.replace(/#/g, "%23");

	var saveEnzymesDialog = document.getElementById("saveEnzymesDialog");
	saveEnzymesDialog.setAttribute("download", "EnzymesToSave.txt");
	saveEnzymesDialog.setAttribute("href", enzymesToSaveFileBody);
	saveEnzymesDialog.click();

	document.getElementById("fileWarning").innerHTML = "";
}

function clean(p1) {
	p2=p1.replace(/\^|\(|\)|[0-9]|\/|-|_|\'/gm,'');
	p2=p2.replace(/[a-z]+/g, (c) => c.toUpperCase());
	return p2;
}

function pressedold(tabName) {
	var i;
	var x = document.getElementsByClassName("tab");
	for (i = 0; i < x.length; i++) {
		x[i].style.display = "none";
	}
	document.getElementById(tabName).style.display = "block";
}

function pressed(evt, tabName) {
	var i, x, tablinks;
	x = document.getElementsByClassName("tab");
	for (i = 0; i < x.length; i++) {
		x[i].style.display = "none";
	}
	tablinks = document.getElementsByClassName("tablink");
	for (i = 0; i < x.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" w3-blue", "");
	}
	document.getElementById(tabName).style.display = "block";
	evt.currentTarget.className += " w3-blue";
}

/*
IUPAC nucleotide code 	Base
A 	Adenine
C 	Cytosine
G 	Guanine
T (or U) 	Thymine (or Uracil)
R 	A or G
Y 	C or T
S 	G or C
W 	A or T
K 	G or T
M 	A or C
B 	C or G or T
D 	A or G or T
H 	A or C or T
V 	A or C or G
N 	any base
. or - 	gap
*/

//

function revcompl(p1) {
	p2=reverse(p1)
	p3=p2.replace(/[A-Z]+/, (c) => c.toLowerCase());
	p4=p3.replace(/[a]/g,'T').replace(/[t]/g,'A').replace(/[c]/g,'G').replace(/[g]/g,'C').replace(/[n]/g,'N');
	p5=p4.replace(/[r]/g,'Y').replace(/[y]/g,'R').replace(/[s]/g,'S').replace(/[w]/g,'W').replace(/[k]/g,'M').replace(/[m]/g,'K')
	p6=p5.replace(/[b]/g,'V').replace(/[b]/g,'B').replace(/[d]/g,'H').replace(/[h]/g,'D')
	return p6;
}

function makeregex(p1) {
	p2 = p1.replace(/[A]/g,'[a]').replace(/[C]/g,'[c]').replace(/[G]/g,'[g]').replace(/[T]/g,'[t]')
	p3 = p2.replace(/[N]/g,'[a,c,g,t]').replace(/[R]/g,'[a,g]').replace(/[Y]/g,'[c,t]').replace(/[S]/g,'[g,c]')
	p4 = p3.replace(/[W]/g,'[a,t]').replace(/[K]/g,'[t,g]').replace(/[M]/g,'[a,c]').replace(/[B]/g,'[g,c,t]')
	p5 = p4.replace(/[D]/g,'[a,g,t]').replace(/[H]/g,'[a,c,t]').replace(/[V]/g,'[a,c,g]')
	return p5
}

function reverse(str)
{
	let reversed = "";
	for (let i = str.length - 1; i >= 0; i--)
	{
		reversed += str[i];
	}
	return reversed;
}

function testforcut(seq, regSites)
{
	let n = 0;

	for(let i = 0; i < regSites.length; i++)
	{
		let re = new RegExp(regSites[i], "i");
		n += seq.search(re);
	}

	return n
}

function numberofcut(seq, regSites)
{
	let n = 0;

	for(let i = 0; i < regSites.length; i++)
	{
		let re = new RegExp(regSites[i], "ig");
		let found = seq.match(re);
		if(found != null){
			n=found.length
		}
	}

	return n
}

var sampleseq1='acaaaaatcgacgctcaagtcagaggtggcgaaacccgacaggactataaagataccaggcgtttccccctggaagctccctcgtgcgctctcctgttccgaccctgccgcttaccggatacctgtccgcctttctcccttcgggaagcgtggcgctttctcatagctcacgctgtaggtatctcagttcggtgtaggtcgttcgctccaagctgggctgtgtgcacgaaccccccgttcagcccgaccgctgcgccttatccggtaactatcgtcttgagtccaacccggtaagacacgacttatcgccactggcagcagccactggtaacaggattagcagagcgaggtatgtaggcggtgctacagagttcttgaagtggtggcctaactacggctacactagaagaacagtatttggtatctgcgctctgctgaagccagttaccttcggaaaaagagttggtagctcttgatccggcaaacaaaccaccgctggtagcggtggtttttttgtttgcaagcagcagattacgcgcagaaaaaaaggatctcaagaagatcctttgatcttttctacggggtctgacgctcagtggaacgaaaactcacgttaagggattttggtcatgagattatcaaaaaggatcttcacctagatccttttaaattaaaaatgaagttttaaatcaatctaaagtatatatgagtaaacttggtctgacagttaccaatgcttaatcagtgaggcacctatctcagcgatctgtctatttcgttcatccatagttgcctgactccccgtcgtgtagataactacgatacgggagggcttaccatctggccccagtgctgcaatgataccgcgagacccacgctcaccggctccagatttatcagcaataaaccagccagccggaagggccgagcgcagaagtggtcctgcaactttatccgcctccatccagtctattaattgttgccgggaagctagagtaagtagttcgccagttaatagtttgcgcaacgttgttgccattgctacaggcatcgtggtgtcacgctcgtcgtttggtatggcttcattcagctccggttcccaacgatcaaggcgagttacatgatcccccatgttgtgcaaaaaagcggttagctccttcggtcctccgatcgttgtcagaagtaagttggccgcagtgttatcactcatggttatggcagcactgcataattctcttactgtcatgccatccgtaagatgcttttctgtgactggtgagtactcaaccaagtcattctgagaatagtgtatgcggcgaccgagttgctcttgcccggcgtcaatacgggataataccgcgccacatagcagaactttaaaagtgctcatcattggaaaacgttcttcggggcgaaaactctcaaggatcttaccgctgttgagatccagttcgatgtaacccactcgtgcacccaactgatcttcagcatcttttactttcaccagcgtttctgggtgagcaaaaacaggaaggcaaaatgccgcaaaaaagggaataagggcgacacggaaatgttgaatactcatactcttcctttttcaatattattgaagcatttatcagggttattgtctcatgagcggatacatatttgaatgtatttagaaaaataaacaaataggggttccgcgcacatttccccgaaaagtgccacctgacgcgccctgtagcggcgcattaagcgcggcgggtgtggtggttacgcgcagcgtgaccgctacacttgccagcgccctagcgcccgctcctttcgctttcttcccttcctttctcgccacgttcgccggctttccccgtcaagctctaaatcgggggctccctttagggttccgatttagtgctttacggcacctcgaccccaaaaaacttgattagggtgatggttcacgtagtgggccatcgccctgatagacggtttttcgccctttgacgttggagtccacgttctttaatagtggactcttgttccaaactggaacaacactcaaccctatctcggtctattcttttgatttataagggattttgccgatttcggcctattggttaaaaaatgagctgatttaacaaaaatttaacgcgaattttaacaaaatattaacgcttacaatttgccattcgccattcaggctgcgcaactgttgggaagggcgatcggtgcgggcctcttcgctattacgccagcccaagctaccatgataagtaagtaatattaaggtacgggaggtacttggagcggccgcaataaaatatctttattttcattacatctgtgtgttggttttttgtgtgaatcgatagtactaacatacgctctccatcaaaacaaaacgaaacaaaacaaactagcaaaataggctgtccccagtgcaagtgcaggtgccagaacatttctctatcgataggtaccgagctcttacgcgtgctagcccgggctcgagatctgcgatctaagtaagcttttaacctaaaagatattacccctgggggtcagaggcaaaatggagtcagtcatgctaagcctccctccactatttcaatttccccattgtcaaaggttcatcccacagtcttgtgggattggggaaaatgagacatcattactcacctggctacttcctgccaaacagggttgacaaggggtgactatggaatgaaaccatttgacctggctaaggaaatatttcgtagtgccatttttaggaacaatgatcatcggcatttccctttttgctttgatagttttagcgagacttgcacaacctttgtttacacagtacataataagttttactagaacgtaggccaccatgactaaaagaagaacatcaaggctgaatttaagaatgcctcccaagattgatggaattacactaggaatccaggagaataggtctttaaagcagtctctgtaagtgcccccagattaagcctgctttggtgttctaaggtttgttaaagccaggtagcctgttgtctaattgtatcaatatgggtctgtagaggaggaattaagctagcaacaggtggctagcttagggacgccatttggtaagtagaaagtaggcttgcggctgggcgcggtggctcacgcctgtaatcccagcactttgggaggccgaggcgggtggatcatgaggtcaggagatcgagaccatcctggctaacaaggtgaaaccccgtctctactaaaaatacaaaaaattagccaggcgcggtggcgggcacctgtagtcccagctactcgggaggctgaggcaggagaatggcgtgaacccgggaagcggagcttgcagtgagccgagattgcgccactgcagtccgcagtcctgcctgggcgacagagcgagactccgtctcaaaaaaaaaaaaaaagaaagtaggcttgcaggcttgtgggtccttattattgctttgcatgtagtgtctaatgaggtgctgcataagaaagaaacatggggcctctgggtatggagttatcaattggatcctatgtatgatttgagaaaccagcttctatagatctaatgcccaagaggctacatgactaaaattatgtgtacaggaacaactagaggatcagagtggtcatgtactgaacaaggtttaagatgacaaatctggcagtgtgatatgctagtgaaagaggcaatagattgagaaatcctaactcaagagttgtcttgccaaggaaacaaaaatctctaaaggacatgcaagacacataggggatacattttcattgtacttatctttttgtgaaacagtagctttcggtctttcaagtgctcacaagcccactgttttcctggtttccggattagtgggctgtcttctggtggtactgccttgacctgagtataatgtgcacatggctttactccagcaagtttaactgataagcgtgtgttcaccagcagctcaaatggccttgtccacttggcagcaaattggtgttcaggtccttgttctttccaggtatttaggaggatctaatttcccagttgaaaaggatgtaggaccacatctgctggatgagtggtcctgctagaagcaaactcatgaacagaagttagtatagtgcctagagtcttaatatttggtaattgccaaatctcttaaaacatcagttggttctcccaccaggacaaaaacctagaatgggctaccagataatacttcaaaggggctcaatttgaacctacttgagggagccactcgaatccacaacagcaatcagcaacatcttatcccaagtcaaattagtttcttgatatattttggcaatgcttctttttagagtatggttcatcttttcagtttttcccatggattgtggtctctaagatgataatctaaaggtttcaggaagagacaagtcacagctcccctgacactcctgtcaccatcatagatagtctttgaattaaggtaggtgggtattaactacagaatacgttgcccctgtatcaataagaaagtcaataagtttgttccccactgtcaattttacccagggctcctgtgggactatgacagcagttggctaagcatacatattcaatgtatgtatgttacagaagaagctacgaatatttatgaaggtgatcctgacacatgcgtattgtacaaacatgcatgttacatatgacccatgtttaccttgaggtgaaagcgtaacatttaaatgtactacaattaggccctgtacatcaaaaggtcttttcagaacacaaaggcatgcaaatgcacaatctctataactagctagaaccagttcatggccagcagtcttattatcaggagaaaattagtgaaatcagtcttttgttcaatcaaagctatagttatggctggtggaactggggttcagttagtcagcatctatgaactggatgagttgaaattgttttaatattgcttgtcttaaggccagtgcttgcttagctgctagagaaaaagagaaaccttgtgtcattgagaatatagcttattctttaagtgtaaggatgcatgacttaactcttgcctggcatggccttaggtcctgtttataatatggtattttattgccacaaaatttcagttatgtcagtcttatgacctctattttaacattagtgttgattagttattgtatctaaaccacaaaagggagagggtataatgaggcgtatctgacttcccatcacattatacctgaagactaagtttttaaggtttttctggggtccccttagccaagagggggtccattcagtcagcagggggcttaatattttatttttagttgacattctcccatttggccaagatataccaaaggcagcataaatggccaaacttttattttgttccatattgttgctgggggtgttgtggctatgtgccccaggtccatcacatcccttggtaggatccctgtggctaaggaactcaaagccaaaagacttgtagtcaattaaacgttttaggccatttggtaagggaggtggccaagcattcattaacccttaaaaccttttaagtaacataagagccaaaaccaaaagccaaatagcaaaggtacaaaactgacctttctataagttctatgtgttgagccatcagctgtttaggcatctgtgtacctatatttggaggatctgaactaattttactccttaaaagtaaaattagtacatcaaaaggtgttttgtgcccacctcttccatgagcgtccttgggcccagagggatttaatagttttttaaatcctggagatattaggtacagagagaaaggtaaacccaatttctataagctataaatagctcaaaaagaaaaaaggcgggccaggcgcagtggctcacgcctgtaatcccagcactttgggaggctgaggcaggcagatcatgaggtcaggagatcaagaccatctttgctaacatggtggaatcccgtctctactaaaaatacaaaaaattagctgggcgtggtggcacgtgcctgtagtcccagctacttgggaggctgagacaggagaatggtgtgaacccaggaggtggagcttgcagtgagccgagattgcgccgctgcactccagcctgggtgacagagcaagactccgtctcagaaaaaaaaaaaaggctttcttgactctggaaaacaaaacataaagaattagcaacatttcaaacttaatttaggattagattttgaggacatttgtcaaaatgttaaagcctcaaaccatttgatcaaaacagaaccgccggtctttgtaaaataataattattcatttcacaaaagtgataattaaaagactttaatagcaatacagaaagttacatgaatataaagacttaacctttctaaagctcagttttcctaagtaatcaaaaacctgataaagataacaagaatgaggaattatcttgagaaaatgtaaaatctttccttttattttttgagacagggtctcactctgtcatccaggctaaagtgcagtggcacaatcatagctcactacagccttgaactcctggactcaagtgatcctcccgcctcagcctccccagtagctaagactacaggcacgcaccaccacacccagctaatttttttcagagatggggtcttgctatattgccctggctggtcttgaacgagcttcaagtgagcgtgagcctcctacctcatcctcccaaagcactaggattacaggcatgagccactgtttcccagcctaaaataattgtttcttaggccagctaccaaaaacgcaaagaaaaactttctgtagtgtgattgcttcttcttatgggaagcccatttagataacctgtaagtcaaacctgatgaaaacaatacttgaatgtaatcagacacagaaagactgttcaaggctatgagtagctgagtccaagctcgtatcacttgccacacaacagccaataagtctagagacaaggtattgtggcaaggaaagctaccttattcagagaaccagaaaaccaagaagatggtggaccagcatcataaagaaccatctgaagtcagcatgaacgttaggctcttctttatgttaagggaaggggaagaagaaggggattgggatcaagaggtgactgatgaccacagacacctgggtgccagcaagggtctgaggacgttgtaaaacttcttttttctaggtcaggtcacaatgttcctatacatctttaacataacattgttatttgtctgtatatttccttatctccttgggggttagtttggggaaaggaactgttaccattttttttaaagttgaactgcaagctaaactcctataattagctggtctatgtacagagctaagcagaagcttttagcctaaaggataatacccctgggggtcagaggcaaaatggagtcagtcatgctaagtctccctccactctctttcttttttgagatggaatttcactcttattgcccaggccggagtgcagtggcatgatctcagctcactgcaacctccgcctcctgggttcaagcaattctcttgcctcagcctcctgagtagctgagattacaggtgtccatcaccacacccagctaatttttgtagtttagtggagatggggtttcaccattgttggtcaggctggtctggaactcctgacctcaggtgatctacccaccttggcctcccaaagtgctgggacaggtgtgagccaccatgcctggcccctctactcttataattaaaccagctgttgcttttcctgccaagaaaccagtcatgaagattcacccatgttctagatgggaaaactgggctgtagcctgggagaggccagtcagggacaaagccaaagttaatatagagaatggagcttccagggtataggggttgggtctgggctagggagctggaaacctaggttttacgcttgtcccagttttgatgttagccctgagcagtgctgtttctcatcagcctctgcctgctccaggggtcacagggccaagccagatagagggctgctagcgtcactggacacaagattgctttcccacagctgtccttcctccagcccctctgctccccatccggaaacctgggtacccttcacccacctagctctgtcccgcagtgagatttattgctgactgccctgccatctaccccagggtaataaatcagggcagagcagaattgcaatcaccccatgcatggagtgtataaaaggggaagggctaagggagccacagaacctcagtggatctgcgatctaagtaagctagcttggcattccggtactgttggtaaagccaccatggaagacgccaaaaacataaagaaaggcccggcgccattctatccgctggaagatggaaccgctggagagcaactgcataaggctatgaagagatacgccctggttcctggaacaattgcttttacagatgcacatatcgaggtggacatcacttacgctgagtacttcgaaatgtccgttcggttggcagaagctatgaaacgatatgggctgaatacaaatcacagaatcgtcgtatgcagtgaaaactctcttcaattctttatgccggtgttgggcgcgttatttatcggagttgcagttgcgcccgcgaacgacatttataatgaacgtgaattgctcaacagtatgggcatttcgcagcctaccgtggtgttcgtttccaaaaaggggttgcaaaaaattttgaacgtgcaaaaaaagctcccaatcatccaaaaaattattatcatggattctaaaacggattaccagggatttcagtcgatgtacacgttcgtcacatctcatctacctcccggttttaatgaatacgattttgtgccagagtccttcgatagggacaagacaattgcactgatcatgaactcctctggatctactggtctgcctaaaggtgtcgctctgcctcatagaactgcctgcgtgagattctcgcatgccagagatcctatttttggcaatcaaatcattccggatactgcgattttaagtgttgttccattccatcacggttttggaatgtttactacactcggatatttgatatgtggatttcgagtcgtcttaatgtatagatttgaagaagagctgtttctgaggagccttcaggattacaagattcaaagtgcgctgctggtgccaaccctattctccttcttcgccaaaagcactctgattgacaaatacgatttatctaatttacacgaaattgcttctggtggcgctcccctctctaaggaagtcggggaagcggttgccaagaggttccatctgccaggtatcaggcaaggatatgggctcactgagactacatcagctattctgattacacccgagggggatgataaaccgggcgcggtcggtaaagttgttccattttttgaagcgaaggttgtggatctggataccgggaaaacgctgggcgttaatcaaagaggcgaactgtgtgtgagaggtcctatgattatgtccggttatgtaaacaatccggaagcgaccaacgccttgattgacaaggatggatggctacattctggagacatagcttactgggacgaagacgaacacttcttcatcgttgaccgcctgaagtctctgattaagtacaaaggctatcaggtggctcccgctgaattggaatccatcttgctccaacaccccaacatcttcgacgcaggtgtcgcaggtcttcccgacgatgacgccggtgaacttcccgccgccgttgttgttttggagcacggaaagacgatgacggaaaaagagatcgtggattacgtcgccagtcaagtaacaaccgcgaaaaagttgcgcggaggagttgtgtttgtggacgaagtaccgaaaggtcttaccggaaaactcgacgcaagaaaaatcagagagatcctcataaaggccaagaagggcggaaagatcgccgtgtaattctagagtcggggcggccggccgcttcgagcagacatgataagatacattgatgagtttggacaaaccacaactagaatgcagtgaaaaaaatgctttatttgtgaaatttgtgatgctattgctttatttgtaaccattataagctgcaataaacaagttaacaacaacaattgcattcattttatgtttcaggttcagggggaggtgtgggaggttttttaaagcaagtaaaacctctacaaatgtggtaaaatcgataaggatccgtcgaccgatgcccttgagagccttcaacccagtcagctccttccggtgggcgcggggcatgactatcgtcgccgcacttatgactgtcttctttatcatgcaactcgtaggacaggtgccggcagcgctcttccgcttcctcgctcactgactcgctgcgctcggtcgttcggctgcggcgagcggtatcagctcactcaaaggcggtaatacggttatccacagaatcaggggataacgcaggaaagaacatgtgagcaaaaggccagcaaaaggccaggaaccgtaaaaaggccgcgttgctggcgtttttccataggctccgcccccctgacgagcatc';
var sampleseq2='ggccgcatagataactgatccagtgtgctggaattaattcgctgtctgcgagggccagctgttggggtgagtactccctctcaaaagcgggcatgacttctgcgctaagattgtcagtttccaaaaacgaggaggatttgatattcacctggcccgcggtgatgcctttgagggtggccgcgtccatctggtcagaaaagacaatctttttgttgtcaagcttgaggtgtggcaggcttgagatctggccatacacttgagtgacaatgacatccactttgcctttctctccacaggtgtccactcccaggtccaactgcaggtcgagcatgcatctagggcggccaattccgcccctctccctcccccccccctaacgttactggccgaagccgcttggaataaggccggtgtgcgtttgtctatatgtgattttccaccatattgccgtcttttggcaatgtgagggcccggaaacctggccctgtcttcttgacgagcattcctaggggtctttcccctctcgccaaaggaatgcaaggtctgttgaatgtcgtgaaggaagcagttcctctggaagcttcttgaagacaaacaacgtctgtagcgaccctttgcaggcagcggaaccccccacctggcgacaggtgcctctgcggccaaaagccacgtgtataagatacacctgcaaaggcggcacaaccccagtgccacgttgtgagttggatagttgtggaaagagtcaaatggctctcctcaagcgtattcaacaaggggctgaaggatgcccagaaggtaccccattgtatgggatctgatctggggcctcggtgcacatgctttacatgtgtttagtcgaggttaaaaaaacgtctaggccccccgaaccacggggacgtggttttcctttgaaaaacacgatgataagcttgccacaacccacaaggagacgaccttccatgaccgagtacaagcccacggtgcgcctcgccacccgcgacgacgtcccccgggccgtacgcaccctcgccgccgcgttcgccgactaccccgccacgcgccacaccgtcgacccggaccgccacatcgagcgggtcaccgagctgcaagaactcttcctcacgcgcgtcgggctcgacatcggcaaggtgtgggtcgcggacgacggcgccgcggtggcggtctggaccacgccggagagcgtcgaagcgggggcggtgttcgccgagatcggcccgcgcatggccgagttgagcggttcccggctggccgcgcagcaacagatggaaggcctcctggcgccgcaccggcccaaggagcccgcgtggttcctggccaccgtcggcgtctcgcccgaccaccagggcaagggtctgggcagcgccgtcgtgctccccggagtggaggcggccgagcgcgccggggtgcccgccttcctggagacctccgcgccccgcaacctccccttctacgagcggctcggcttcaccgtcaccgccgacgtcgagtgcccgaaggaccgcgcgacctggtgcatgacccgcaagcccggtgcctgacgcccgccccacgacccgcagcgcccgaccgaaaggagcgcacgaccccatggctccgaccgaagccgacccgggcggccccgccgaccccgcacccgcccccgaggcccaccgactctagagctcgctgatcagcctcgactgtgccttctagttgccagccatctgttgtttgcccctcccccgtgccttccttgaccctggaaggtgccactcccactgtcctttcctaataaaatgaggaaattgcatcgcattgtctgagtaggtgtcattctattctggggggtggggtggggcaggacagcaagggggaggattgggaagacaatagcaggcatgctggggatgcggtgggctctatggcttctgaggcggaaagaaccagctggggc';
var sampleseq3='tcgaccgatgcccttgagagccttcaacccagtcagctccttccggtgggcgcggggcatgactatcgtcgccgcacttatgactgtcttctttatcatgcaactcgtaggacaggtgccggcagcgctcttccgcttcctcgctcactgactcgctgcgctcggtcgttcggctgcggcgagcggtatcagctcactcaaaggcggtaatacggttatccacagaatcaggggataacgcaggaaagaacatgtgagcaaaaggccagcaaaaggccaggaaccgtaaaaaggccgcgttgctggcgtttttccataggctccgcccccctgacgagcatcacaaaaatcgacgctcaagtcagaggtggcgaaacccgacaggactataaagataccaggcgtttccccctggaagctccctcgtgcgctctcctgttccgaccctgccgcttaccggatacctgtccgcctttctcccttcgggaagcgtggcgctttctcatagctcacgctgtaggtatctcagttcggtgtaggtcgttcgctccaagctgggctgtgtgcacgaaccccccgttcagcccgaccgctgcgccttatccggtaactatcgtcttgagtccaacccggtaagacacgacttatcgccactggcagcagccactggtaacaggattagcagagcgaggtatgtaggcggtgctacagagttcttgaagtggtggcctaactacggctacactagaagaacagtatttggtatctgcgctctgctgaagccagttaccttcggaaaaagagttggtagctcttgatccggcaaacaaaccaccgctggtagcggtggtttttttgtttgcaagcagcagattacgcgcagaaaaaaaggatctcaagaagatcctttgatcttttctacggggtctgacgctcagtggaacgaaaactcacgttaagggattttggtcatgagattatcaaaaaggatcttcacctagatccttttaaattaaaaatgaagttttaaatcaatctaaagtatatatgagtaaacttggtctgacagttaccaatgcttaatcagtgaggcacctatctcagcgatctgtctatttcgttcatccatagttgcctgactccccgtcgtgtagataactacgatacgggagggcttaccatctggccccagtgctgcaatgataccgcgagacccacgctcaccggctccagatttatcagcaataaaccagccagccggaagggccgagcgcagaagtggtcctgcaactttatccgcctccatccagtctattaattgttgccgggaagctagagtaagtagttcgccagttaatagtttgcgcaacgttgttgccattgctacaggcatcgtggtgtcacgctcgtcgtttggtatggcttcattcagctccggttcccaacgatcaaggcgagttacatgatcccccatgttgtgcaaaaaagcggttagctccttcggtcctccgatcgttgtcagaagtaagttggccgcagtgttatcactcatggttatggcagcactgcataattctcttactgtcatgccatccgtaagatgcttttctgtgactggtgagtactcaaccaagtcattctgagaatagtgtatgcggcgaccgagttgctcttgcccggcgtcaatacgggataataccgcgccacatagcagaactttaaaagtgctcatcattggaaaacgttcttcggggcgaaaactctcaaggatcttaccgctgttgagatccagttcgatgtaacccactcgtgcacccaactgatcttcagcatcttttactttcaccagcgtttctgggtgagcaaaaacaggaaggcaaaatgccgcaaaaaagggaataagggcgacacggaaatgttgaatactcatactcttcctttttcaatattattgaagcatttatcagggttattgtctcatgagcggatacatatttgaatgtatttagaaaaataaacaaataggggttccgcgcacatttccccgaaaagtgccacctgacgcgccctgtagcggcgcattaagcgcggcgggtgtggtggttacgcgcagcgtgaccgctacacttgccagcgccctagcgcccgctcctttcgctttcttcccttcctttctcgccacgttcgccggctttccccgtcaagctctaaatcgggggctccctttagggttccgatttagtgctttacggcacctcgaccccaaaaaacttgattagggtgatggttcacgtagtgggccatcgccctgatagacggtttttcgccctttgacgttggagtccacgttctttaatagtggactcttgttccaaactggaacaacactcaaccctatctcggtctattcttttgatttataagggattttgccgatttcggcctattggttaaaaaatgagctgatttaacaaaaatttaacgcgaattttaacaaaatattaacgcttacaatttgccattcgccattcaggctgcgcaactgttgggaagggcgatcggtgcgggcctcttcgctattacgccagcccaagctaccatgataagtaagtaatattaaggtacgggaggtacttggagcggccgcaataaaatatctttattttcattacatctgtgtgttggttttttgtgtgaatcgatagtactaacatacgctctccatcaaaacaaaacgaaacaaaacaaactagcaaaataggctgtccccagtgcaagtgcaggtgccagaacatttctctatcgataggtaccgagctcttacgcgtgctagcccgggctcgagatctgcgatctaagtaagcttttaacctaaaagatattacccctgggggtcagaggcaaaatggagtcagtcatgctaagcctccctccactatttcaatttccccattgtcaaaggttcatcccacagtcttgtgggattggggaaaatgagacatcattactcacctggctacttcctgccaaacagggttgacaaggggtgactatggaatgaaaccatttgacctggctaaggaaatatttcgtagtgccatttttaggaacaatgatcatcggcatttccctttttgctttgatagttttagcgagacttgcacaacctttgtttacacagtacataataagttttactagaacgtaggccaccatgactaaaagaagaacatcaaggctgaatttaagaatgcctcccaagattgatggaattacactaggaatccaggagaataggtctttaaagcagtctctgtaagtgcccccagattaagcctgctttggtgttctaaggtttgttaaagccaggtagcctgttgtctaattgtatcaatatgggtctgtagaggaggaattaagctagcaacaggtggctagcttagggacgccatttggtaagtagaaagtaggcttgcggctgggcgcggtggctcacgcctgtaatcccagcactttgggaggccgaggcgggtggatcatgaggtcaggagatcgagaccatcctggctaacaaggtgaaaccccgtctctactaaaaatacaaaaaattagccaggcgcggtggcgggcacctgtagtcccagctactcgggaggctgaggcaggagaatggcgtgaacccgggaagcggagcttgcagtgagccgagattgcgccactgcagtccgcagtcctgcctgggcgacagagcgagactccgtctcaaaaaaaaaaaaaaagaaagtaggcttgcaggcttgtgggtccttattattgctttgcatgtagtgtctaatgaggtgctgcataagaaagaaacatggggcctctgggtatggagttatcaattggatcctatgtatgatttgagaaaccagcttctatagatctaatgcccaagaggctacatgactaaaattatgtgtacaggaacaactagaggatcagagtggtcatgtactgaacaaggtttaagatgacaaatctggcagtgtgatatgctagtgaaagaggcaatagattgagaaatcctaactcaagagttgtcttgccaaggaaacaaaaatctctaaaggacatgcaagacacataggggatacattttcattgtacttatctttttgtgaaacagtagctttcggtctttcaagtgctcacaagcccactgttttcctggtttccggattagtgggctgtcttctggtggtactgccttgacctgagtataatgtgcacatggctttactccagcaagtttaactgataagcgtgtgttcaccagcagctcaaatggccttgtccacttggcagcaaattggtgttcaggtccttgttctttccaggtatttaggaggatctaatttcccagttgaaaaggatgtaggaccacatctgctggatgagtggtcctgctagaagcaaactcatgaacagaagttagtatagtgcctagagtcttaatatttggtaattgccaaatctcttaaaacatcagttggttctcccaccaggacaaaaacctagaatgggctaccagataatacttcaaaggggctcaatttgaacctacttgagggagccactcgaatccacaacagcaatcagcaacatcttatcccaagtcaaattagtttcttgatatattttggcaatgcttctttttagagtatggttcatcttttcagtttttcccatggattgtggtctctaagatgataatctaaaggtttcaggaagagacaagtcacagctcccctgacactcctgtcaccatcatagatagtctttgaattaaggtaggtgggtattaactacagaatacgttgcccctgtatcaataagaaagtcaataagtttgttccccactgtcaattttacccagggctcctgtgggactatgacagcagttggctaagcatacatattcaatgtatgtatgttacagaagaagctacgaatatttatgaaggtgatcctgacacatgcgtattgtacaaacatgcatgttacatatgacccatgtttaccttgaggtgaaagcgtaacatttaaatgtactacaattaggccctgtacatcaaaaggtcttttcagaacacaaaggcatgcaaatgcacaatctctataactagctagaaccagttcatggccagcagtcttattatcaggagaaaattagtgaaatcagtcttttgttcaatcaaagctatagttatggctggtggaactggggttcagttagtcagcatctatgaactggatgagttgaaattgttttaatattgcttgtcttaaggccagtgcttgcttagctgctagagaaaaagagaaaccttgtgtcattgagaatatagcttattctttaagtgtaaggatgcatgacttaactcttgcctggcatggccttaggtcctgtttataatatggtattttattgccacaaaatttcagttatgtcagtcttatgacctctattttaacattagtgttgattagttattgtatctaaaccacaaaagggagagggtataatgaggcgtatctgacttcccatcacattatacctgaagactaagtttttaaggtttttctggggtccccttagccaagagggggtccattcagtcagcagggggcttaatattttatttttagttgacattctcccatttggccaagatataccaaaggcagcataaatggccaaacttttattttgttccatattgttgctgggggtgttgtggctatgtgccccaggtccatcacatcccttggtaggatccctgtggctaaggaactcaaagccaaaagacttgtagtcaattaaacgttttaggccatttggtaagggaggtggccaagcattcattaacccttaaaaccttttaagtaacataagagccaaaaccaaaagccaaatagcaaaggtacaaaactgacctttctataagttctatgtgttgagccatcagctgtttaggcatctgtgtacctatatttggaggatctgaactaattttactccttaaaagtaaaattagtacatcaaaaggtgttttgtgcccacctcttccatgagcgtccttgggcccagagggatttaatagttttttaaatcctggagatattaggtacagagagaaaggtaaacccaatttctataagctataaatagctcaaaaagaaaaaaggcgggccaggcgcagtggctcacgcctgtaatcccagcactttgggaggctgaggcaggcagatcatgaggtcaggagatcaagaccatctttgctaacatggtggaatcccgtctctactaaaaatacaaaaaattagctgggcgtggtggcacgtgcctgtagtcccagctacttgggaggctgagacaggagaatggtgtgaacccaggaggtggagcttgcagtgagccgagattgcgccgctgcactccagcctgggtgacagagcaagactccgtctcagaaaaaaaaaaaaggctttcttgactctggaaaacaaaacataaagaattagcaacatttcaaacttaatttaggattagattttgaggacatttgtcaaaatgttaaagcctcaaaccatttgatcaaaacagaaccgccggtctttgtaaaataataattattcatttcacaaaagtgataattaaaagactttaatagcaatacagaaagttacatgaatataaagacttaacctttctaaagctcagttttcctaagtaatcaaaaacctgataaagataacaagaatgaggaattatcttgagaaaatgtaaaatctttccttttattttttgagacagggtctcactctgtcatccaggctaaagtgcagtggcacaatcatagctcactacagccttgaactcctggactcaagtgatcctcccgcctcagcctccccagtagctaagactacaggcacgcaccaccacacccagctaatttttttcagagatggggtcttgctatattgccctggctggtcttgaacgagcttcaagtgagcgtgagcctcctacctcatcctcccaaagcactaggattacaggcatgagccactgtttcccagcctaaaataattgtttcttaggccagctaccaaaaacgcaaagaaaaactttctgtagtgtgattgcttcttcttatgggaagcccatttagataacctgtaagtcaaacctgatgaaaacaatacttgaatgtaatcagacacagaaagactgttcaaggctatgagtagctgagtccaagctcgtatcacttgccacacaacagccaataagtctagagacaaggtattgtggcaaggaaagctaccttattcagagaaccagaaaaccaagaagatggtggaccagcatcataaagaaccatctgaagtcagcatgaacgttaggctcttctttatgttaagggaaggggaagaagaaggggattgggatcaagaggtgactgatgaccacagacacctgggtgccagcaagggtctgaggacgttgtaaaacttcttttttctaggtcaggtcacaatgttcctatacatctttaacataacattgttatttgtctgtatatttccttatctccttgggggttagtttggggaaaggaactgttaccattttttttaaagttgaactgcaagctaaactcctataattagctggtctatgtacagagctaagcagaagcttttagcctaaaggataatacccctgggggtcagaggcaaaatggagtcagtcatgctaagtctccctccactctctttcttttttgagatggaatttcactcttattgcccaggccggagtgcagtggcatgatctcagctcactgcaacctccgcctcctgggttcaagcaattctcttgcctcagcctcctgagtagctgagattacaggtgtccatcaccacacccagctaatttttgtagtttagtggagatggggtttcaccattgttggtcaggctggtctggaactcctgacctcaggtgatctacccaccttggcctcccaaagtgctgggacaggtgtgagccaccatgcctggcccctctactcttataattaaaccagctgttgcttttcctgccaagaaaccagtcatgaagattcacccatgttctagatgggaaaactgggctgtagcctgggagaggccagtcagggacaaagccaaagttaatatagagaatggagcttccagggtataggggttgggtctgggctagggagctggaaacctaggttttacgcttgtcccagttttgatgttagccctgagcagtgctgtttctcatcagcctctgcctgctccaggggtcacagggccaagccagatagagggctgctagcgtcactggacacaagattgctttcccacagctgtccttcctccagcccctctgctccccatccggaaacctgggtacccttcacccacctagctctgtcccgcagtgagatttattgctgactgccctgccatctaccccagggtaataaatcagggcagagcagaattgcaatcaccccatgcatggagtgtataaaaggggaagggctaagggagccacagaacctcagtggatctgcgatctaagtaagctagcttggcattccggtactgttggtaaagccaccatggaagacgccaaaaacataaagaaaggcccggcgccattctatccgctggaagatggaaccgctggagagcaactgcataaggctatgaagagatacgccctggttcctggaacaattgcttttacagatgcacatatcgaggtggacatcacttacgctgagtacttcgaaatgtccgttcggttggcagaagctatgaaacgatatgggctgaatacaaatcacagaatcgtcgtatgcagtgaaaactctcttcaattctttatgccggtgttgggcgcgttatttatcggagttgcagttgcgcccgcgaacgacatttataatgaacgtgaattgctcaacagtatgggcatttcgcagcctaccgtggtgttcgtttccaaaaaggggttgcaaaaaattttgaacgtgcaaaaaaagctcccaatcatccaaaaaattattatcatggattctaaaacggattaccagggatttcagtcgatgtacacgttcgtcacatctcatctacctcccggttttaatgaatacgattttgtgccagagtccttcgatagggacaagacaattgcactgatcatgaactcctctggatctactggtctgcctaaaggtgtcgctctgcctcatagaactgcctgcgtgagattctcgcatgccagagatcctatttttggcaatcaaatcattccggatactgcgattttaagtgttgttccattccatcacggttttggaatgtttactacactcggatatttgatatgtggatttcgagtcgtcttaatgtatagatttgaagaagagctgtttctgaggagccttcaggattacaagattcaaagtgcgctgctggtgccaaccctattctccttcttcgccaaaagcactctgattgacaaatacgatttatctaatttacacgaaattgcttctggtggcgctcccctctctaaggaagtcggggaagcggttgccaagaggttccatctgccaggtatcaggcaaggatatgggctcactgagactacatcagctattctgattacacccgagggggatgataaaccgggcgcggtcggtaaagttgttccattttttgaagcgaaggttgtggatctggataccgggaaaacgctgggcgttaatcaaagaggcgaactgtgtgtgagaggtcctatgattatgtccggttatgtaaacaatccggaagcgaccaacgccttgattgacaaggatggatggctacattctggagacatagcttactgggacgaagacgaacacttcttcatcgttgaccgcctgaagtctctgattaagtacaaaggctatcaggtggctcccgctgaattggaatccatcttgctccaacaccccaacatcttcgacgcaggtgtcgcaggtcttcccgacgatgacgccggtgaacttcccgccgccgttgttgttttggagcacggaaagacgatgacggaaaaagagatcgtggattacgtcgccagtcaagtaacaaccgcgaaaaagttgcgcggaggagttgtgtttgtggacgaagtaccgaaaggtcttaccggaaaactcgacgcaagaaaaatcagagagatcctcataaaggccaagaagggcggaaagatcgccgtgtaattctagagtcggggcggccggcagcctgcagcgcggccgcatagataactgatccagtgtgctggaattaattcgctgtctgcgagggccagctgttggggtgagtactccctctcaaaagcgggcatgacttctgcgctaagattgtcagtttccaaaaacgaggaggatttgatattcacctggcccgcggtgatgcctttgagggtggccgcgtccatctggtcagaaaagacaatctttttgttgtcaagcttgaggtgtggcaggcttgagatctggccatacacttgagtgacaatgacatccactttgcctttctctccacaggtgtccactcccaggtccaactgcaggtcgagcatgcatctagggcggccaattccgcccctctccctcccccccccctaacgttactggccgaagccgcttggaataaggccggtgtgcgtttgtctatatgtgattttccaccatattgccgtcttttggcaatgtgagggcccggaaacctggccctgtcttcttgacgagcattcctaggggtctttcccctctcgccaaaggaatgcaaggtctgttgaatgtcgtgaaggaagcagttcctctggaagcttcttgaagacaaacaacgtctgtagcgaccctttgcaggcagcggaaccccccacctggcgacaggtgcctctgcggccaaaagccacgtgtataagatacacctgcaaaggcggcacaaccccagtgccacgttgtgagttggatagttgtggaaagagtcaaatggctctcctcaagcgtattcaacaaggggctgaaggatgcccagaaggtaccccattgtatgggatctgatctggggcctcggtgcacatgctttacatgtgtttagtcgaggttaaaaaaacgtctaggccccccgaaccacggggacgtggttttcctttgaaaaacacgatgataagcttgccacaacccacaaggagacgaccttccatgaccgagtacaagcccacggtgcgcctcgccacccgcgacgacgtcccccgggccgtacgcaccctcgccgccgcgttcgccgactaccccgccacgcgccacaccgtcgacccggaccgccacatcgagcgggtcaccgagctgcaagaactcttcctcacgcgcgtcgggctcgacatcggcaaggtgtgggtcgcggacgacggcgccgcggtggcggtctggaccacgccggagagcgtcgaagcgggggcggtgttcgccgagatcggcccgcgcatggccgagttgagcggttcccggctggccgcgcagcaacagatggaaggcctcctggcgccgcaccggcccaaggagcccgcgtggttcctggccaccgtcggcgtctcgcccgaccaccagggcaagggtctgggcagcgccgtcgtgctccccggagtggaggcggccgagcgcgccggggtgcccgccttcctggagacctccgcgccccgcaacctccccttctacgagcggctcggcttcaccgtcaccgccgacgtcgagtgcccgaaggaccgcgcgacctggtgcatgacccgcaagcccggtgcctgacgcccgccccacgacccgcagcgcccgaccgaaaggagcgcacgaccccatggctccgaccgaagccgacccgggcggccccgccgaccccgcacccgcccccgaggcccaccgactctagagctcgctgatcagcctcgactgtgccttctagttgccagccatctgttgtttgcccctcccccgtgccttccttgaccctggaaggtgccactcccactgtcctttcctaataaaatgaggaaattgcatcgcattgtctgagtaggtgtcattctattctggggggtggggtggggcaggacagcaagggggaggattgggaagacaatagcaggcatgctggggatgcggtgggctctatggcttctgaggcggaaagaaccagctggggc';

function clearseq(id){
	document.getElementById(id).value='';
	clearresults()

	document.getElementById("fileWarning").innerHTML = "";
}

function clearSequences(){
	clearseq('seq1')
	clearseq('seq2')
	clearseq('seq3')
	clearresults()
}

function setseq(id, seq)
{
	document.getElementById(id).value=seq;
	document.getElementById("fileWarning").innerHTML = "";
}

function loadSequence(id)
{
	var loadSequenceDialog = document.getElementById("loadSequenceDialog");
	loadSequenceDialog.customTextFieldId = id;
	loadSequenceDialog.click();

	document.getElementById("fileWarning").innerHTML = "";
}

function onChangeLoadSequences()
{
	var loadSequenceDialog = document.getElementById("loadSequenceDialog");

	var sequenceFile = loadSequenceDialog.files[0];
	var id = loadSequenceDialog.customTextFieldId;

	var reader = new FileReader();
	reader.onload = function(event)
	{
		document.getElementById(id).value = event.target.result;
	};

	reader.readAsText(sequenceFile);
}

function clearresults()
{
	document.getElementById("fileWarning").innerHTML = "";

	document.getElementById("NoFragmentMessage").setAttribute('style', "display: none;color:red;");

	let gelDrawings = document.getElementById("gelDrawings");
	while(gelDrawings.firstChild)
	{
		gelDrawings.firstChild.remove()
	}
}

function getFastaID(seq, seqID){
	if(seq.startsWith(">"))
		// Gives an array of strings, even so this way it only contains one element
		return seq.match(/^>.*\n/)[0].slice(0, -1);
	else
		return ">Seq" + seqID;
}

function remvoveFastaID(seq){
	seqout=seq.replace(/^>.*\n/, '');
	//console.log(seqout);
	return seqout
}

function remvoveFurtherFastaSeqs(seq){
	seqout=seq.replace(/>[\s\S]*/m, '');
	//console.log(seqout);
	return seqout
}

function tidydna(seq){
	var seqout=seq.replace(/[^a-z,A-Z]|[\,]/g, '');
	//console.log(seq + '#'+ seqout);
	return seqout
}

function tidydnaATCG(seq){
	var seqout=seq.replace(/[^a,t,g,c,A,T,G,C]|[\,]/g, '');
	//console.log(seq + '#'+ seqout);
	return seqout
}

function getSequence(seqID){
	var commenttext = document.getElementById("commenton").innerHTML;
	// Get the value of the input field
	var seq=document.getElementById("seq" + seqID).value;

	var seqObject = new Object();
	seqObject.id = getFastaID(seq, seqID);

	seq = remvoveFastaID(seq);
	seqF = remvoveFurtherFastaSeqs(seq);
	var fRemoved=(seq.length!=seqF.length);
	seq = tidydna(seqF);
	commenttext = commenttext + "Sequence " + seqID + ": " + seq.length.toString().bold() + " chars, ";

	var checkseq=tidydnaATCG(seq);

	if(checkseq.length!=seq.length){
		commenttext = commenttext + ' but only ' + checkseq.length.toString().bold().fontcolor('red') + " ATGCs(!), please check input!, ".fontcolor('red');
	}

	if(fRemoved){
		commenttext = commenttext + "contains more than one FASTA sequence, additional sequences are ignored! ".fontcolor('red');
	}

	document.getElementById("commenton").innerHTML = commenttext;

	seqObject.isCircular = document.getElementById("circular" + seqID).checked;
	seqObject.seq = seq;
//	console.log("Test:", seqObject);

	// Should probably go in the final version, that isn't that clean anyway.
	if(document.getElementById("circular" + seqID).checked == true){
		seq=seq+seq.substr(0, 30) //find matches also for the circular case
	}

	seqObject.circSeq = seq;

	return seqObject;
}

function makeCutText(enzyme, seq)
{
	return enzyme.name + getRecSitesText(enzyme.recognition) +
	' ' + numberofcut(seq, enzyme.regexfw)+ ' ' + numberofcut(seq, enzyme.regexrv) +
	' <a href="http://rebase.neb.com/rebase/enz/'+ enzyme.name +'.html" target="_blank" rel="noopener">'+ enzyme.name+'</a>'+
	'<BR>';
}

function makeCutNonText(enzyme)
{
	return enzyme.name + getRecSitesText(enzyme.recognition) +
	' <a href="http://rebase.neb.com/rebase/enz/'+ enzyme.name +'.html" target="_blank" rel="noopener">'+ enzyme.name+'</a>'+
	'<BR>';
}

function getRecSitesText(recSites)
{
	let recSiteText = "";
	for(let i = 0; i < recSites.length; i++)
	{
		recSiteText += " " + recSites[i].bold();
	}

	return recSiteText;
}

function myFunction() {
	let	commenttext='Info: ';

	document.getElementById("fileWarning").innerHTML = "";

	document.getElementById("commenton").innerHTML = commenttext;
	seqObj1=getSequence("1");
	seqObj2=getSequence("2");
	seqObj3=getSequence("3");

	seq1 = seqObj1.circSeq;
	seq2 = seqObj2.circSeq;
	seq3 = seqObj3.circSeq;
	let differentiatingEnzymes = findDifferentiatingEnzyme(seqObj1, seqObj2, seqObj3);
}

function getMaxLength(fragments)
{
	let maxLength = 0;
	for(var i = 0; i < fragments.length; i++)
	{
		if(maxLength < fragments[i].length)
			maxLength = fragments[i].length;
	}

	return maxLength;
}

function getMaxLength2(fragments1, fragments2, fragments3)
{
	let maxLength1 = getMaxLength(fragments1);
	let maxLength2 = getMaxLength(fragments2);
	let maxLength3 = getMaxLength(fragments3);

	return Math.max(maxLength1, maxLength2, maxLength3);
}

function plotFragments(fragments1, fragments2, fragments3, enzyme)
{
	const ladder      = [   10,    50,   100,   200,   300,   400,  500,   600,   700,   800,   900, 1000,  1200,  1500,  2000,  2500,  3000,  3500,  4000,  5000,  6000,  8000, 10000]
	const bold        = [false, false, false, false, false, false, true, false, false, false, false, true, false, false, false, false,  true, false, false, false, false, false, false]
	const scaleFactor = 100;
	let   gelBottom   = document.getElementById("gelBottom").value;
	let maxLadder = ladder[ladder.length-1];
	let maxLength = getMaxLength2(fragments1, fragments2, fragments3);
	if (maxLength < maxLadder)
		maxLength = maxLadder;
	maxLength    = Math.round(Math.log(maxLength) * scaleFactor);
	let gelBottomLog = 0;
	if(gelBottom > 1)
	{
		gelBottomLog = Math.round(Math.log(gelBottom) * scaleFactor);
	}

	const padding        = 50;
	const margin         = 25;
	const marginSizes    = 50;
	const bandLength     = 50;
	const sizeLabelRight = 45;
	let   gelWidth       = marginSizes + 4*bandLength + 5*margin;
	let   gelHeight      = maxLength + 2*padding - gelBottomLog;
	let gelDrawing       = document.createElementNS('http://www.w3.org/2000/svg','svg');
	gelDrawing.setAttribute('id', 'Gel-' + enzyme.name);
	gelDrawing.setAttribute('width', gelWidth);
	gelDrawing.setAttribute('height', gelHeight);

	let gelFrame = document.createElementNS('http://www.w3.org/2000/svg','rect');
	gelFrame.setAttribute('width', gelWidth-2 - marginSizes);
	gelFrame.setAttribute('height', gelHeight-2);
	gelFrame.setAttribute('style', "stroke-width:1;stroke:black;fill:transparent");
	gelFrame.setAttribute('x', 1 + marginSizes);
	gelFrame.setAttribute('y', 1);
	gelDrawing.appendChild(gelFrame);

	let leftPos = margin + marginSizes;
	for (let i = 0; i < ladder.length; i++)
	{
		if(ladder[i] < gelBottom)
			continue;

		let width = "3";
		if(bold[i])
		{
			width = "6"
		}

		let length = Math.round(Math.log(ladder[i]) * scaleFactor);
		let pos = maxLength - length + padding;
		var gelBand = document.createElementNS('http://www.w3.org/2000/svg','line');
		gelBand.setAttribute('style', "stroke-width:" + width + ";stroke:black");
		gelBand.setAttribute('x1', leftPos);
		gelBand.setAttribute('y1', pos);
		gelBand.setAttribute('x2', leftPos + bandLength);
		gelBand.setAttribute('y2', pos);
		gelDrawing.appendChild(gelBand);
	}

	leftPos += bandLength;
	leftPos += margin;
	for (let i = 0; i < fragments1.length; i++)
	{
		if(fragments1[i].length < gelBottom)
			continue;

		let length = Math.round(Math.log(fragments1[i].length) * scaleFactor);
		let pos = maxLength - length + padding;
		var gelBand = document.createElementNS('http://www.w3.org/2000/svg','line');
		gelBand.setAttribute('style', "stroke-width:3;stroke:red");
		gelBand.setAttribute('x1', leftPos);
		gelBand.setAttribute('y1', pos);
		gelBand.setAttribute('x2', leftPos + bandLength);
		gelBand.setAttribute('y2', pos);
		gelDrawing.appendChild(gelBand);
	}

	leftPos += bandLength;
	leftPos += margin;
	for (let i = 0; i < fragments2.length; i++)
	{
		if(fragments2[i].length < gelBottom)
			continue;

		let length = Math.round(Math.log(fragments2[i].length) * scaleFactor);
		let pos = maxLength - length + padding;
		var gelBand = document.createElementNS('http://www.w3.org/2000/svg','line');
		gelBand.setAttribute('style', "stroke-width:3;stroke:green");
		gelBand.setAttribute('x1', leftPos);
		gelBand.setAttribute('y1', pos);
		gelBand.setAttribute('x2', leftPos + bandLength);
		gelBand.setAttribute('y2', pos);
		gelDrawing.appendChild(gelBand);
	}

	leftPos += bandLength;
	leftPos += margin;
	for (let i = 0; i < fragments3.length; i++)
	{
		if(fragments3[i].length < gelBottom)
			continue;

		let length = Math.round(Math.log(fragments3[i].length) * scaleFactor);
		let pos = maxLength - length + padding;
		var gelBand = document.createElementNS('http://www.w3.org/2000/svg','line');
		gelBand.setAttribute('style', "stroke-width:3;stroke:blue");
		gelBand.setAttribute('x1', leftPos);
		gelBand.setAttribute('y1', pos);
		gelBand.setAttribute('x2', leftPos + bandLength);
		gelBand.setAttribute('y2', pos);
		gelDrawing.appendChild(gelBand);
	}

	document.getElementById("gelDrawings").appendChild(gelDrawing);
	let linebreak = document.createElement("br");
	document.getElementById("gelDrawings").appendChild(linebreak);

	let enzymeName = document.createElementNS('http://www.w3.org/2000/svg','text');
	enzymeName.textContent = enzyme.name;
	enzymeName.setAttribute('fill', 'black');
	gelDrawing.appendChild(enzymeName);
	// getBBox only gives proper numbers when it is on screen.
	let bbox = enzymeName.getBBox();

	enzymeName.setAttribute('x', marginSizes/2 + gelWidth/2 - bbox.width/2);
	enzymeName.setAttribute('y', bbox.height);

	for(let i = 0; i < ladder.length; ++i)
	{
		if(ladder[i] < gelBottom)
			continue;

		let size = document.createElementNS('http://www.w3.org/2000/svg','text');
		size.textContent = ladder[i];
		size.setAttribute('fill', 'black');
		if(bold[i])
		{
			size.setAttribute('font-weight', 'bold');
		}

		gelDrawing.appendChild(size);
		let bbox = size.getBBox();

		let length = Math.round(Math.log(ladder[i]) * scaleFactor);
		let pos = maxLength - length + padding;

		size.setAttribute('x', sizeLabelRight - bbox.width);
		size.setAttribute('y', pos + bbox.height/4);
	}
}

function findDifferentiatingEnzyme(seqObj1, seqObj2, seqObj3) {
	clearresults();
	let enzymesToUse = document.getElementById("EnzymesToUse");

	let differentiatingEnzymes = [];

	for (let i = 0; i < enzymeArray.length; i++)
	{
		if(enzymesToUse.namedItem(enzymeArray[i].name) == null)
		{
			continue;
		}

		let fragments1 = generateFragments(enzymeArray[i], seqObj1);
		let fragments2 = generateFragments(enzymeArray[i], seqObj2);
		let fragments3 = generateFragments(enzymeArray[i], seqObj3);

		let minFragments    = document.getElementById("minFragments").value;
		if (minFragments > fragments1.length && seqObj1.seq.length > 0
		||  minFragments > fragments2.length && seqObj2.seq.length > 0
		||  minFragments > fragments3.length && seqObj3.seq.length > 0
		){
			continue;
		}

		let maxFragments    = document.getElementById("maxFragments").value;
		if (maxFragments < fragments1.length && seqObj1.seq.length > 0
		||  maxFragments < fragments2.length && seqObj2.seq.length > 0
		||  maxFragments < fragments3.length && seqObj3.seq.length > 0
		){
			continue;
		}

		let minFragmentSize = document.getElementById("minFragmentSize").value;
		if(!noneSmaller(fragments1, minFragmentSize)) continue;
		if(!noneSmaller(fragments2, minFragmentSize)) continue;
		if(!noneSmaller(fragments3, minFragmentSize)) continue;

		let maxFragmentSize = document.getElementById("maxFragmentSize").value;
		if(!noneBigger(fragments1, maxFragmentSize)) continue;
		if(!noneBigger(fragments2, maxFragmentSize)) continue;
		if(!noneBigger(fragments3, maxFragmentSize)) continue;

//		if (!isDifferentiable(fragments1, fragments2, fragments3))
//			continue;

		let enzymeResults = new Object();
		enzymeResults.enzyme = enzymeArray[i];
		enzymeResults.fragments1 = fragments1;
		enzymeResults.fragments2 = fragments2;
		enzymeResults.fragments3 = fragments3;
		enzymeResults.distance = calcDistance3(fragments1, fragments2, fragments3);
		differentiatingEnzymes.push(enzymeResults);
	}

	if(document.getElementById("alphabetical_A-Z").checked)
	{
		for(let i = 0; i < differentiatingEnzymes.length; i++)
		{
			let enzymeResults = differentiatingEnzymes[i];
			plotFragments(enzymeResults.fragments1, enzymeResults.fragments2, enzymeResults.fragments3, enzymeResults.enzyme);
		}
	}
	else if(document.getElementById("alphabetical_Z-A").checked)
	{
		for(let i = differentiatingEnzymes.length-1; i >= 0 ; i--)
		{
			let enzymeResults = differentiatingEnzymes[i];
			plotFragments(enzymeResults.fragments1, enzymeResults.fragments2, enzymeResults.fragments3, enzymeResults.enzyme);
		}
	}
	else if(document.getElementById("patternUnsimilarity").checked)
	{
		differentiatingEnzymes.sort(function(a, b){return b.distance-a.distance});
		for(let i = 0; i < differentiatingEnzymes.length; i++)
		{
			let enzymeResults = differentiatingEnzymes[i];
			console.log(enzymeResults);
			plotFragments(enzymeResults.fragments1, enzymeResults.fragments2, enzymeResults.fragments3, enzymeResults.enzyme);
		}
	}
	else if(document.getElementById("patternSimilarity").checked)
	{
		differentiatingEnzymes.sort(function(a, b){return a.distance-b.distance});
		for(let i = 0; i < differentiatingEnzymes.length; i++)
		{
			let enzymeResults = differentiatingEnzymes[i];
			console.log(enzymeResults);
			plotFragments(enzymeResults.fragments1, enzymeResults.fragments2, enzymeResults.fragments3, enzymeResults.enzyme);
		}
	}

	if(differentiatingEnzymes.length <= 0)
	{
		document.getElementById("NoFragmentMessage").setAttribute('style', "display: block;color:red;");
	}

	return differentiatingEnzymes;
}

function calcDistance3(fragments1, fragments2, fragments3)
{
	let sum = 0;
	let num = 0;

	if(fragments1.length > 0)
	{
		sum += calcDistance(fragments1);
		num++;
	}

	if(fragments2.length > 0)
	{
		sum += calcDistance(fragments2);
		num++;
	}

	if(fragments3.length > 0)
	{
		sum += calcDistance(fragments3);
		num++;
	}

	if(num > 0)
	{
		return sum/num;
	}
	else
	{
		return 0;
	}
}

function calcDistance(fragments)
{
	let sum = 0;
	let num = 0;
	// Calculate the pairwise distances
	// The distance to itself is zero, but we don't need this
	// Only the one triangle of the matrix is needed
	for(let i = 0; i < fragments.length; ++i)
	{
		for(let j = 0; j < i; ++j)
		{
			sum += Math.abs(Math.log(fragments[i].length) - Math.log(fragments[j].length));
			num++;
		}
	}

	if(num > 0)
	{
		return sum/num;
	}
	else
	{
		return 0;
	}
}

function noneBigger(fragments, maxValue)
{
	for(let i = 0; i < fragments.length; ++i)
	{
		if(fragments[i].length > maxValue)
			return false;
	}

	return true;
}

function noneSmaller(fragments, minValue)
{
	for(let i = 0; i < fragments.length; ++i)
	{
		if(fragments[i].length < minValue)
			return false;
	}

	return true;
}

function isDifferentiable(fragments1, fragments2, fragments3) {
	// Check for clear differences, e.g., number of fragments or unique fragment sizes
	if (fragments1.length !== fragments2.length) return true;
	for (let i = 0; i < fragments1.length; i++) {
		if (Math.abs(fragments1[i]/fragments2[i]) > 1.2) { // 20% difference , Customize this threshold
			return true;
		}
	}
	return false;
}

function getCutPositions(enzyme, sequence)
{

	let matchIndices = [];

	for (let i = 0; i < enzyme.regexfw.length; i++)
	{
		let matchIndicesFor = Array.from(sequence.matchAll(enzyme.regexfw[i])).map(x => x.index + enzyme.cutPosFw[i]);
		let matchIndicesRev = Array.from(sequence.matchAll(enzyme.regexrv[i])).map(x => x.index + enzyme.cutPosRv[i]);

		matchIndices = matchIndices.concat(matchIndicesFor);
		matchIndices = matchIndices.concat(matchIndicesRev);
	}

	if (matchIndices.length > 0)
	{
		matchIndices.sort(function(a, b){return a-b});
		matchIndices = [...new Set(matchIndices)];
	}

	return matchIndices;
}

function generateFragments(enzyme, seqObj) {

	let fragments = [];
	if(seqObj.seq.length == 0)
	{
		return fragments;
	}

	let matchIndices = getCutPositions(enzyme, seqObj.seq);

	if (matchIndices.length > 0)
	{
		if(seqObj.isCircular)
		{
			let start1   = 0;
			let end1     = matchIndices[0];
			let part1    = seqObj.seq.slice(start1, end1)
			let start2   = matchIndices[matchIndices.length-1];
			let part2    = seqObj.seq.slice(start2)
			let endStart = part2 + part1;

			let matchIndicesEndStart = getCutPositions(enzyme, endStart);

			if (matchIndicesEndStart.length > 0)
			{
				let start = 0;
				let end   = matchIndicesEndStart[0];
				if(end > 0)
				{
					fragments.push(endStart.slice(start, end));
				}

				for (let i = 0; i < matchIndicesEndStart.length-1; i++)
				{
					let start = matchIndicesEndStart[i];
					let end   = matchIndicesEndStart[i+1];
					fragments.push(endStart.slice(start, end));
				}

				start = matchIndicesEndStart[matchIndicesEndStart.length-1];
				if(endStart.length < start)
				{
					fragments.push(endStart.slice(start));
				}
			}
			else
			{
				fragments.push(endStart);
			}
		}
		else
		{
			let start = 0;
			let end   = matchIndices[0];
			if(end > 0)
			{
				fragments.push(seqObj.seq.slice(start, end));
			}
		}

		for (let i = 0; i < matchIndices.length-1; i++) {
			let start = matchIndices[i];
			let end   = matchIndices[i+1];
			fragments.push(seqObj.seq.slice(start, end));
		}

		if(!seqObj.isCircular)
		{
			let start = matchIndices[matchIndices.length-1];
			if(seqObj.seq.length < start)
			{
				fragments.push(seqObj.seq.slice(start));
			}
		}
	}
	else
	{
		if(seqObj.isCircular)
		{
			let half = seqObj.seq.length / 2;
			let part1 = seqObj.seq.slice(0, half);
			let part2 = seqObj.seq.slice(half);
			let rotated = part2 + part1;
			let matchIndicesRotated = getCutPositions(enzyme, rotated);

			if (matchIndicesRotated.length > 0)
			{
				let start = 0;
				let end   = matchIndicesRotated[0];
				if(end > 0)
				{
					fragments.push(rotated.slice(start, end));
				}

				for (let i = 0; i < matchIndicesRotated.length-1; i++)
				{
					let start = matchIndicesRotated[i];
					let end   = matchIndicesRotated[i+1];
					fragments.push(rotated.slice(start, end));
				}

				start = matchIndicesRotated[matchIndicesRotated.length-1];
				if(rotated.length < start)
				{
					fragments.push(rotated.slice(start));
				}
			}
			else
			{
				fragments.push(seqObj.seq);
			}
		}
		else
		{
			fragments.push(seqObj.seq);
		}
	}

	return fragments;
}
