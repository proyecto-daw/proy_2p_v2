from django.db import models
from django import forms

# Create your models here.


 # Create your models here.	# Create your models here.
class ModelForm(models.Model):
    nombres = models.CharField('Nombres',blank=False,null=False,max_length=120)
    apellidos = models.CharField('Apellidos',blank=False,null=False,max_length=120)
    correo = models.EmailField('Correo')
    fecha_de_nacimiento = models.DateField('Fecha de Nacimiento')
    ORIGEN = (('Azu','Azuay'), ('Bol','Bolivar'), ('Cañ','Cañar'), ('Car','Carchi'), ('Chi','Chimborazo'),
              ('Cot','Cotopaxi'), ('El','El Oro'), ('Es','Esmeraldas'),('Gal','Galápagos'), ('Gua','Guayas'),
              ('Imb','Imbabura'), ('Loj','Loja'), ('Los','Los Ríos'), ('Man','Manabí'), ('Mor','Morona Santiago'),
              ('Nap','Napo'),('Ore','Orellana'), ('Pas','Pastaza'), ('Pic','Pichincha'), ('San','Santa Elena'),
              ('Sant','Santo Domingo de los Tsáchilas'),('Suc','Sucumbios'),('Tun','Tungurahua'), ('Zam','Zamora Chinchipe'))
    lugar_origen = models.CharField(choices=ORIGEN,max_length=30)
    comentarios = models.TextField(blank=True,null=True)

    def __str__(self):
        return "Nombres:               {0}\n" \
               "Apellidos:             {1}\n" \
               "Correo electronico:    {2}\n" \
               "Fecha de Nacimiento:   {3}\n" \
               "Lugar de Origen:       {4}\n" \
               "Comentarios:           {5}\n".format(self.nombres,self.apellidos,self.correo,
                                                   self.fecha_de_nacimiento,self.lugar_origen,self.comentarios)
    @classmethod
    def create(cls, nombres,apellido,correo,fecha,lugar,comentarios):
        book = cls(nombres=nombres,apellidos=apellido,correo=correo,fecha_de_nacimiento=fecha,
                   lugar_origen=lugar,comentarios=comentarios)
        # do something with the book
        return book


class FormularioContactusForm(forms.ModelForm):
    class Meta:
        model = ModelForm
        fields = [
            'nombres',
            'apellidos',
            'correo',
            'fecha_de_nacimiento',
            'lugar_origen',
            'comentarios',
        ]

class FormularioContactanos(forms.Form):
    nombres = forms.CharField(widget=forms.TextInput(attrs={
       "placeholder": "Nombres",
        "type":"Text",
        "class":"form-group row form-control form-control-user",
        "id": "firstName",
        "name":"firstName"
    }))
    apellidos = forms.CharField(widget=forms.TextInput(attrs={
       'placeholder': "Apellidos",
        "type": "Text",
        "class": "form-group row form-control form-control-user",
        "id": "lastName",
        "name": "lastName"
    }))
    correo = forms.EmailField(widget=forms.TextInput(attrs={
        'placeholder': "Correo electrónico de contacto",
        "type": "email",
        "class": "form-control form-control-user",
        "id": "inputEmail",
        "name": "inputEmail"
    }))
    fecha_de_nacimiento = forms.DateField(widget=forms.DateInput(attrs={
        "type":"date",
        "class":"form-control form-control-user",
        "id":"inputBornDate",
        "name": "inputBornDate"
    }))
    lugar_origen = forms.CharField(widget=forms.TextInput(attrs={
        "type": "text",
        "class": "form-control form-control-user",
        "id": "inputPlace",
        "name": "provincias",
        "placeholder": "Lugar de origen",
        "list": "provincias"
    }))
    comentarios = forms.CharField(required=False,widget=forms.Textarea(attrs={
        "type": "text",
        "class": "form-control  form-control-user",
        "id": "textbox",
        "name": "Text1",
        "row": 6,
        "placeholder": "Comentarios"
    }))