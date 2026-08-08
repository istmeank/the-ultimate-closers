"""
Script d'installation automatique pour Proton ANK Backend
Usage: python setup.py
"""

import os
import sys
import subprocess
import platform

def print_step(step_num, message):
    """Affiche une étape numérotée"""
    print(f"\n{'='*60}")
    print(f"ÉTAPE {step_num}: {message}")
    print(f"{'='*60}\n")

def run_command(command, error_message):
    """Execute une commande shell"""
    try:
        subprocess.run(command, shell=True, check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ ERREUR: {error_message}")
        print(f"Détails: {e}")
        return False

def check_python_version():
    """Vérifie la version de Python"""
    print_step(1, "Vérification de la version Python")
    version = sys.version_info
    print(f"Version Python détectée: {version.major}.{version.minor}.{version.micro}")

    if version.major < 3 or (version.major == 3 and version.minor < 9):
        print("❌ Python 3.9 ou supérieur est requis")
        return False

    print("✅ Version Python valide")
    return True

def check_cuda():
    """Vérifie si CUDA est disponible"""
    print_step(2, "Vérification de CUDA")

    try:
        import torch
        if torch.cuda.is_available():
            print(f"✅ CUDA disponible: {torch.cuda.get_device_name(0)}")
            return True
        else:
            print("⚠️  CUDA non disponible - le modèle tournera sur CPU (plus lent)")
            return False
    except ImportError:
        print("⚠️  PyTorch pas encore installé - vérification CUDA impossible")
        return False

def create_venv():
    """Crée un environnement virtuel"""
    print_step(3, "Création de l'environnement virtuel")

    if os.path.exists("venv"):
        print("⚠️  L'environnement virtuel existe déjà")
        response = input("Voulez-vous le recréer ? (o/n): ")
        if response.lower() != 'o':
            print("✅ Environnement virtuel conservé")
            return True
        print("Suppression de l'ancien environnement...")
        if platform.system() == "Windows":
            run_command("rmdir /s /q venv", "Impossible de supprimer venv")
        else:
            run_command("rm -rf venv", "Impossible de supprimer venv")

    print("Création de l'environnement virtuel...")
    if not run_command("python -m venv venv", "Échec de création de l'environnement virtuel"):
        return False

    print("✅ Environnement virtuel créé avec succès")
    return True

def install_dependencies():
    """Installe les dépendances"""
    print_step(4, "Installation des dépendances")

    # Déterminer la commande pip selon l'OS
    if platform.system() == "Windows":
        pip_cmd = "venv\\Scripts\\pip"
    else:
        pip_cmd = "venv/bin/pip"

    print("Mise à jour de pip...")
    if not run_command(f"{pip_cmd} install --upgrade pip", "Échec de mise à jour de pip"):
        return False

    print("Installation des dépendances (cela peut prendre plusieurs minutes)...")
    if not run_command(f"{pip_cmd} install -r requirements.txt", "Échec d'installation des dépendances"):
        return False

    print("✅ Dépendances installées avec succès")
    return True

def setup_env_file():
    """Configure le fichier .env"""
    print_step(5, "Configuration du fichier .env")

    if os.path.exists(".env"):
        print("⚠️  Le fichier .env existe déjà")
        response = input("Voulez-vous le reconfigurer ? (o/n): ")
        if response.lower() != 'o':
            print("✅ Configuration .env conservée")
            return True

    if not os.path.exists(".env.example"):
        print("❌ Fichier .env.example introuvable")
        return False

    print("Copie de .env.example vers .env...")
    if platform.system() == "Windows":
        run_command("copy .env.example .env", "Échec de copie")
    else:
        run_command("cp .env.example .env", "Échec de copie")

    print("\n📝 Configuration interractive:")

    # Demander les configurations importantes
    model_path = input("\nChemin vers le modèle Nemotron (ou ENTER pour télécharger automatiquement): ").strip()

    device = "cuda"
    response = input("\nVoulez-vous utiliser CUDA (GPU) ? (o/n) [o]: ").strip().lower()
    if response == 'n':
        device = "cpu"

    port = input("\nPort pour l'API [8001]: ").strip() or "8001"

    # Mettre à jour le fichier .env
    with open(".env", "r") as f:
        env_content = f.read()

    if model_path:
        env_content = env_content.replace("MODEL_PATH=/path/to/local/model", f"MODEL_PATH={model_path}")

    env_content = env_content.replace("DEVICE=cuda", f"DEVICE={device}")
    env_content = env_content.replace("PORT=8001", f"PORT={port}")

    with open(".env", "w") as f:
        f.write(env_content)

    print("✅ Fichier .env configuré")
    return True

def test_installation():
    """Teste l'installation"""
    print_step(6, "Test de l'installation")

    print("Import de FastAPI...")
    if platform.system() == "Windows":
        python_cmd = "venv\\Scripts\\python"
    else:
        python_cmd = "venv/bin/python"

    test_script = """
import sys
try:
    import fastapi
    print("✅ FastAPI installé")
    import torch
    print(f"✅ PyTorch installé (CUDA: {torch.cuda.is_available()})")
    import transformers
    print("✅ Transformers installé")
    print("\\n🎉 Tous les packages sont installés correctement!")
    sys.exit(0)
except ImportError as e:
    print(f"❌ Erreur d'import: {e}")
    sys.exit(1)
    """

    with open("test_install.py", "w") as f:
        f.write(test_script)

    success = run_command(f"{python_cmd} test_install.py", "Échec du test d'installation")

    os.remove("test_install.py")

    return success

def print_next_steps():
    """Affiche les prochaines étapes"""
    print("\n" + "="*60)
    print("🎉 INSTALLATION TERMINÉE AVEC SUCCÈS!")
    print("="*60)

    if platform.system() == "Windows":
        activate_cmd = "venv\\Scripts\\activate"
        python_cmd = "venv\\Scripts\\python"
    else:
        activate_cmd = "source venv/bin/activate"
        python_cmd = "venv/bin/python"

    print("\n📋 PROCHAINES ÉTAPES:\n")
    print("1. Activer l'environnement virtuel:")
    print(f"   {activate_cmd}")
    print("\n2. Vérifier le fichier .env:")
    print("   Éditez .env et configurez MODEL_PATH si nécessaire")
    print("\n3. Télécharger le modèle Nemotron H 8b si pas déjà fait:")
    print("   Vous pouvez le télécharger depuis Hugging Face")
    print("\n4. Démarrer le serveur:")
    print(f"   {python_cmd} main.py")
    print("\n5. Tester l'API:")
    print("   Ouvrez http://localhost:8001/docs dans votre navigateur")
    print("\n" + "="*60)

def main():
    """Fonction principale"""
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║           🧠 PROTON ANK - INSTALLATION SETUP             ║
    ║                                                           ║
    ║        LLM Propriétaire pour The Ultimate Closers        ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    """)

    # Vérifications préalables
    if not check_python_version():
        sys.exit(1)

    # Création de l'environnement
    if not create_venv():
        print("\n❌ Échec de création de l'environnement virtuel")
        sys.exit(1)

    # Installation des dépendances
    if not install_dependencies():
        print("\n❌ Échec de l'installation des dépendances")
        sys.exit(1)

    # Vérification CUDA (après installation de PyTorch)
    check_cuda()

    # Configuration .env
    if not setup_env_file():
        print("\n⚠️  Erreur de configuration .env, mais vous pouvez le configurer manuellement")

    # Test de l'installation
    if not test_installation():
        print("\n⚠️  Des problèmes ont été détectés, mais l'installation de base est faite")

    # Afficher les prochaines étapes
    print_next_steps()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Installation interrompue par l'utilisateur")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erreur inattendue: {e}")
        sys.exit(1)
