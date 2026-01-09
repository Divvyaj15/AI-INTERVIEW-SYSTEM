# Makefile

# --- Configurable variables ---
PORT=8501
VENV_DIR=.venv

# ================================
# === Helper =====================
# ================================

help:
	@echo "Usage: make <target>"
	@echo ""
	@echo "This project is configured to run locally."
	@echo "To run the application, use: streamlit run app.py"