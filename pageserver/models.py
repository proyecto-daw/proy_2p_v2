from django.db import models

# Create your models here.
from django import forms


 # Create your models here.	# Create your models here.

class FormularioContactanos(forms.Form):
    nombres = forms.CharField()
    apellidos = forms.CharField()
    correo = forms.EmailField()
    fecha = forms.DateField()
    ORIGEN = (('Azuay'),('Bolivar'),('Cañar'),('Carchi'),('Chimborazo'),('Cotopaxi'),('El Oro'),('Esmeraldas'),
              ('Galápagos'),('Guayas'),('Imbabura'),('Loja'),('Los Ríos'),('Manabí'),('Morona Santiago'),('Napo'),
              ('Orellana'),('Pastaza'),('Pichincha'),('Santa Elena'),('Santo Domingo de los Tsáchilas'),('Sucumbios'),
              ('Tungurahua'),('Zamira Chinchipe'))
    lugar_origen = forms.CharField()
    comentarios = forms.CharField()