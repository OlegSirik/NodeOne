Структура для хранения шаблонов 

startpoint -
	folder1 -
		template1
		template2
		template3
	folder2 -
		template1
		template2
		template3
	
для генерации шаблона нужно передать 3 части пути
startpoint настраивается в файле json


{ "shablon"    : "templ1.docx",
  "folder"     : "folder1", 
  "startpoint" : "CLAIM",
  "data":
{
    "first_name": "John",
    "last_name": "Doe",
    "phone": "0652455478",
    "description": "New Website"
}
}