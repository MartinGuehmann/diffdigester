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
	var rawEntry = enzymeentry[i].split('\t');

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
		enzyme.regexfw[0] = makeregex(reverseComplement);
		enzyme.regexrv[0] = makeregex(cleanRecognition);

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

		enzymeArray.push(enzyme);
	}
	else
	{
		var newIndex = enzyme.recognition.length;
		enzyme.recognition[newIndex] = rawEntry[1];;

		cleanRecognition = clean(enzyme.recognition[newIndex]);
		reverseComplement = revcompl(cleanRecognition);

		enzyme.regexfw[newIndex] = makeregex(reverseComplement);
		enzyme.regexrv[newIndex] = makeregex(cleanRecognition);

		enzyme.cutPosFw[newIndex] = enzyme.recognition[newIndex].indexOf("\'");
		enzyme.cutPosRv[newIndex] = enzyme.recognition[newIndex].indexOf("_");
		if(enzyme.cutPosRv[newIndex] == -1)
			enzyme.cutPosRv[newIndex] = enzyme.cutPosFw[newIndex];
		else if(enzyme.cutPosFw[newIndex] < enzyme.cutPosRv[newIndex])
			enzyme.cutPosRv[newIndex]--;
		else if(enzyme.cutPosFw[newIndex] > enzyme.cutPosRv[newIndex])
			enzyme.cutPosFw[newIndex]--;
	}
}

window.onload=function()
{
	initEnzymeLists();
	resetListLabels();
}

function resetListLabels()
{
	document.getElementById("cutinseq1notin3Label").innerHTML = cutinseq1notin3Label + ":";
	document.getElementById("cutinseq2notin3Label").innerHTML = cutinseq2notin3Label + ":";

	document.getElementById("cutinseq1Label").innerHTML = cutinseq1Label + ":";
	document.getElementById("cutinseq2Label").innerHTML = cutinseq2Label + ":";
	document.getElementById("cutinseq3Label").innerHTML = cutinseq3Label + ":";

	document.getElementById("nocutinseq1Label").innerHTML = nocutinseq1Label + ":";
	document.getElementById("nocutinseq2Label").innerHTML = nocutinseq2Label + ":";
	document.getElementById("nocutinseq3Label").innerHTML = nocutinseq3Label + ":";
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

function clearresults(){
	document.getElementById("cutinseq1").innerHTML ='';
	document.getElementById("cutinseq2").innerHTML = '';
	document.getElementById("cutinseq3").innerHTML = '';
	document.getElementById("cutinseq1notin3").innerHTML = '';
	document.getElementById("cutinseq2notin3").innerHTML = '';
	document.getElementById("nocutinseq1").innerHTML ='';
	document.getElementById("nocutinseq2").innerHTML = '';
	document.getElementById("nocutinseq3").innerHTML = '';

	document.getElementById("fileWarning").innerHTML = "";

	resetListLabels();
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

	if(document.getElementById("circular" + seqID).checked == true){
		seq=seq+seq.substr(0, 30) //find matches also for the circular case
	}

	document.getElementById("commenton").innerHTML = commenttext;

	return seq;
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
	var seq1, seq2, seq3, checkseq, text1='', text2 = '', text3='',
		notext1='', notext2 = '', notext3='',text13='',text23 ='' ,
		nfw1,nrv1,nfw2,nrv2,nfw3,nrv3,
		commenttext='Info: ';

	var allSeqsNum = 0;

	var seq1CutNum = 0;
	var seq2CutNum = 0;
	var seq3CutNum = 0;

	var seq1NoCutNum = 0;
	var seq2NoCutNum = 0;
	var seq3NoCutNum = 0;

	var seq13CutNum = 0;
	var seq23CutNum = 0;

	document.getElementById("fileWarning").innerHTML = "";

	document.getElementById("commenton").innerHTML = commenttext;
	seq1=getSequence("1");
	seq2=getSequence("2");
	seq3=getSequence("3");

	let differentiatingEnzymes = findDifferentiatingEnzyme(seq1, seq2);
	console.log("Enzymes that can differentiate the plasmids:", differentiatingEnzymes);

	var enzymesToUse = document.getElementById("EnzymesToUse");

	for (var i = 0; i < enzymeArray.length; i++)
	{
		if(enzymesToUse.namedItem(enzymeArray[i].name) == null)
		{
			continue;
		}

		allSeqsNum++;

		nfw1=testforcut(seq1, enzymeArray[i].regexfw);
		nrv1=testforcut(seq1, enzymeArray[i].regexrv);
		nfw2=testforcut(seq2, enzymeArray[i].regexfw);
		nrv2=testforcut(seq2, enzymeArray[i].regexrv);
		nfw3=testforcut(seq3, enzymeArray[i].regexfw);
		nrv3=testforcut(seq3, enzymeArray[i].regexrv);

		n1=nfw1+nrv1
		if(n1 >-2 ){
			seq1CutNum++;
			text1 += makeCutText(enzymeArray[i], seq1);
		}else{
			seq1NoCutNum++;
			notext1 += makeCutNonText(enzymeArray[i]);
		}

		n2=nfw2+nrv2
		if(n2 >-2 ){
			seq2CutNum++;
			text2 += makeCutText(enzymeArray[i], seq2);
		}else{
			seq2NoCutNum++;
			notext2 += makeCutNonText(enzymeArray[i]);
		}

		n3=nfw3+nrv3
		if(n3 >-2 ){
			seq3CutNum++;
			text3 += makeCutText(enzymeArray[i], seq3);
		}else{
			seq3NoCutNum++;
			notext3 += makeCutNonText(enzymeArray[i]);
		}

		if((n1>-2)&&(n3==-2)){
			seq13CutNum++;
			text13 += makeCutText(enzymeArray[i], seq1);
		}

		if((n2>-2)&&(n3==-2)){
			seq23CutNum++;
			text23 += makeCutText(enzymeArray[i], seq2);
		}
	}

	document.getElementById("cutinseq1").innerHTML = text1;
	document.getElementById("cutinseq2").innerHTML = text2;
	document.getElementById("cutinseq3").innerHTML = text3;

	if(seq3.length>1){
		document.getElementById("cutinseq1notin3").innerHTML = text13;
		document.getElementById("cutinseq2notin3").innerHTML = text23;
	}
	else{
		document.getElementById("cutinseq1notin3").innerHTML = '';
		document.getElementById("cutinseq2notin3").innerHTML = '';
	}

	if(seq1.length>1){document.getElementById("nocutinseq1").innerHTML = notext1;} else document.getElementById("nocutinseq1").innerHTML = '';
	if(seq2.length>1){document.getElementById("nocutinseq2").innerHTML = notext2;} else document.getElementById("nocutinseq2").innerHTML = '';
	if(seq3.length>1){document.getElementById("nocutinseq3").innerHTML = notext3;} else document.getElementById("nocutinseq3").innerHTML = '';

	document.getElementById("cutinseq1notin3Label").innerHTML = cutinseq1notin3Label + " (" + seq13CutNum + " of " + allSeqsNum + " selected enzymes):";
	document.getElementById("cutinseq2notin3Label").innerHTML = cutinseq2notin3Label + " (" + seq23CutNum + " of " + allSeqsNum + " selected enzymes):";

	document.getElementById("cutinseq1Label").innerHTML = cutinseq1Label + " (" + seq1CutNum + " of " + allSeqsNum + " selected enzymes):";
	document.getElementById("cutinseq2Label").innerHTML = cutinseq2Label + " (" + seq2CutNum + " of " + allSeqsNum + " selected enzymes):";
	document.getElementById("cutinseq3Label").innerHTML = cutinseq3Label + " (" + seq3CutNum + " of " + allSeqsNum + " selected enzymes):";

	document.getElementById("nocutinseq1Label").innerHTML = nocutinseq1Label + " (" + seq1NoCutNum + " of " + allSeqsNum + " selected enzymes):";
	document.getElementById("nocutinseq2Label").innerHTML = nocutinseq2Label + " (" + seq2NoCutNum + " of " + allSeqsNum + " selected enzymes):";
	document.getElementById("nocutinseq3Label").innerHTML = nocutinseq3Label + " (" + seq3NoCutNum + " of " + allSeqsNum + " selected enzymes):";
}


// Assuming enzymeList is an array of enzyme names
// and generateFragments is a function that takes enzyme and plasmid sequence and returns fragment lengths



function findDifferentiatingEnzyme(plasmid1, plasmid2) {
	var enzymesToUse = document.getElementById("EnzymesToUse");

	let differentiatingEnzymes = [];

	for (var i = 0; i < enzymeArray.length; i++)
	{
		if(enzymesToUse.namedItem(enzymeArray[i].name) == null)
		{
			continue;
		}

		let fragments1 = generateFragments(enzymeArray[i], plasmid1);
		let fragments2 = generateFragments(enzymeArray[i], plasmid2);

		let output1 = ">\n"
		output1 += fragments1[0];
		for(let i = 1; i < fragments1.length; ++i)
		{
			output1 += "\n>\n";
			output1 += fragments1[i];
		}
		document.getElementById("frag1").value = output1;

		let output2 = ">\n"
		output2 += fragments2[0];
		for(let i = 1; i < fragments2.length; ++i)
		{
			output2 += "\n>\n";
			output2 += fragments2[i];
		}
		document.getElementById("frag2").value = output2;

		console.log("Fragments1:", fragments1);
		console.log("Fragments2:", fragments2);

		if (isDifferentiable(fragments1, fragments2)) {
			differentiatingEnzymes.push(enzymeArray[i]);
		}
	};

	return differentiatingEnzymes;
}

function isDifferentiable(fragments1, fragments2) {
	// Check for clear differences, e.g., number of fragments or unique fragment sizes
	if (fragments1.length !== fragments2.length) return true;
	for (let i = 0; i < fragments1.length; i++) {
		if (Math.abs(fragments1[i]/fragments2[i]) > 1.2) { // 20% difference , Customize this threshold
			return true;
		}
	}
	return false;
}

// Example function that generates fragments
function generateFragments(enzyme, plasmidSequence) {

	let matchIndices = [];

	for (let i = 0; i < enzyme.regexfw.length; i++)
	{
		let matchIndicesFor = Array.from(plasmidSequence.matchAll(enzyme.regexfw[i])).map(x => x.index + enzyme.cutPosFw[i]);
		let matchIndicesRev = Array.from(plasmidSequence.matchAll(enzyme.regexrv[i])).map(x => x.index + enzyme.cutPosRv[i]);

		matchIndices = matchIndices.concat(matchIndicesFor);
		matchIndices = matchIndices.concat(matchIndicesRev);
	}

	matchIndices.sort(function(a, b){return a-b});
	matchIndices = [...new Set(matchIndices)];

	let fragments = []
	for (let i = 0; i < matchIndices.length-1; i++) {
		let start = matchIndices[i];
		let end   = matchIndices[i+1];
		fragments.push(plasmidSequence.slice(start, end));
	}

	// @ToDo: Do circular matching and end pieces
	let start = matchIndices[matchIndices.length-1];
	fragments.push(plasmidSequence.slice(start));

	return fragments;
}
