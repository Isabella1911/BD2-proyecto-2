from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime


# ─── USUARIO ─────────────────────────────────────────────────────────────────

class UsuarioCreate(BaseModel):
    nombre: str
    correo: str
    password: str
    activo: bool = True
    rol: str  # "Gerente" | "Manager"


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    correo: Optional[str] = None
    activo: Optional[bool] = None
    rol: Optional[str] = None


class UsuarioLogin(BaseModel):
    correo: str
    password: str


# ─── SUPERMERCADO ─────────────────────────────────────────────────────────────

class SupermercadoCreate(BaseModel):
    cadena: str
    nombre: str
    direccion: str
    activo: bool = True


class SupermercadoUpdate(BaseModel):
    cadena: Optional[str] = None
    nombre: Optional[str] = None
    direccion: Optional[str] = None
    activo: Optional[bool] = None


# ─── PRODUCTO ─────────────────────────────────────────────────────────────────

class ProductoCreate(BaseModel):
    nombre: str
    precio: float
    peso: float
    categoria: str
    fecha: str          # ISO date string
    disponible: bool = True


class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    precio: Optional[float] = None
    peso: Optional[float] = None
    categoria: Optional[str] = None
    fecha: Optional[str] = None
    disponible: Optional[bool] = None


# ─── ALMACÉN ──────────────────────────────────────────────────────────────────

class AlmacenCreate(BaseModel):
    nombre: str
    lugar: str
    capacidad: int
    activo: bool = True
    tipos: List[str]         # lista de tipos de producto que maneja
    fecha_apertura: str      # ISO date string


class AlmacenUpdate(BaseModel):
    nombre: Optional[str] = None
    lugar: Optional[str] = None
    capacidad: Optional[int] = None
    activo: Optional[bool] = None
    tipos: Optional[List[str]] = None
    fecha_apertura: Optional[str] = None


# ─── ORDEN ────────────────────────────────────────────────────────────────────

class OrdenItem(BaseModel):
    producto_id: str
    cantidad: int
    precio_unitario: float
    descuento: float = 0.0
    devolucion: bool = False


class OrdenCreate(BaseModel):
    urgencia: str           # "baja" | "normal" | "alta" | "urgente"
    estado: str = "pendiente"
    total: float
    usuario_id: str
    supermercado_id: str
    almacen_id: str
    items: List[OrdenItem]


class OrdenUpdate(BaseModel):
    urgencia: Optional[str] = None
    estado: Optional[str] = None
    total: Optional[float] = None


# ─── TRANSPORTISTA ───────────────────────────────────────────────────────────

class TransportistaCreate(BaseModel):
    nombre: str
    transporte: str
    rating: float
    activo: bool = True
    flota: str


class TransportistaUpdate(BaseModel):
    nombre: Optional[str] = None
    transporte: Optional[str] = None
    rating: Optional[float] = None
    activo: Optional[bool] = None
    flota: Optional[str] = None


# ─── RELACIONES ───────────────────────────────────────────────────────────────

class AsignadoACreate(BaseModel):
    usuario_id: str
    supermercado_id: str
    rol_en_sucursal: str
    fecha_inicio: str
    activo: bool = True


class SupervisaCreate(BaseModel):
    usuario_id: str
    supermercado_id: str
    fecha_inicio: str
    activo: bool = True


class TransportadaPorCreate(BaseModel):
    orden_id: str
    transportista_id: str
    costo: float
    ubicacion: str
    fecha_entrega: str


class DistribuyeCreate(BaseModel):
    transportista_id: str
    almacen_id: str
    zona: str
    activo: bool = True
    calificacion: float


class TieneInventarioCreate(BaseModel):
    supermercado_id: str
    producto_id: str
    cantidad: int
    stock_minimo: int
    fecha_actualizacion: str


class AlmacenadoEnCreate(BaseModel):
    producto_id: str
    almacen_id: str
    cantidad: int
    fecha_ingreso: str
    ubicacion: str


# ─── BULK PROPERTY UPDATE ────────────────────────────────────────────────────

class BulkPropertyUpdate(BaseModel):
    ids: List[str]
    properties: dict


class BulkPropertyDelete(BaseModel):
    ids: List[str]
    property_keys: List[str]
