import logging
import os
from logging.handlers import RotatingFileHandler


# Crear carpeta de logs si no existe
LOG_DIR = "Logs"
os.makedirs(LOG_DIR, exist_ok=True)

# Logger principal
logger = logging.getLogger("app")
logger.setLevel(logging.DEBUG)

# Evitar agregar handlers varias veces
if not logger.handlers:

    # Formato de los logs
    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # -------------------------
    # Consola
    # -------------------------
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)

    # -------------------------
    # Archivo
    # -------------------------
    file_handler = RotatingFileHandler(
        os.path.join(LOG_DIR, "app.log"),
        maxBytes=5 * 1024 * 1024,  # 5 MB
        backupCount=5,
        encoding="utf-8"
    )

    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)

    # Agregar handlers
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)