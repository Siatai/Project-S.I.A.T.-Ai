import os

output_file = "project_structure.txt"

with open(output_file, "w", encoding="utf-8") as f:
    for root, dirs, files in os.walk("."):
        level = root.replace(os.getcwd(), "").count(os.sep)
        indent = "  " * level
        f.write(f"{indent}{os.path.basename(root)}/\n")
        for file in files:
            subindent = "  " * (level + 1)
            f.write(f"{subindent}{file}\n")

print(f"✅ Project structure saved to {output_file}")
