import os
import shutil
from pathlib import Path
from subprocess import check_call

if __name__ == '__main__':
    markus_url = "ssh://drprj@markus.teach.cs.toronto.edu/2024-01/csc309/group_11714.git"
    markus_repo = Path(__file__).parent.parent / 'markus3'
    this_repo = Path(__file__).parent

    # 1. Clone the markus repository if it doesn't exist
    if not markus_repo.exists():
        check_call(['git', 'clone', markus_url, markus_repo])

    # 2. Override P3 files to the markus repository
    print("Overriding...")
    p3_dir = markus_repo / 'P3'
    if p3_dir.exists():
        shutil.rmtree(p3_dir)

    shutil.copytree(this_repo, p3_dir / 'source', ignore=shutil.ignore_patterns(
        *[l for l in Path(this_repo / '.gitignore').read_text().split('\n')
          if l.strip() != '' and not l.startswith('#')] + ['.git']
    ))

    # 3. Add startup.sh, run.sh, and docs.pdf
    shutil.copy(this_repo / 'docs/main.pdf', p3_dir / 'docs.pdf')
    Path(p3_dir / 'README.txt').write_text("""
All of our project files are located in the 'source' directory. Please cd into the 'source' directory to run the project.
""".strip())

    # 4. Commit the built files in P1 to the repository
    check_call(['git', 'status'], cwd=markus_repo)
    check_call(['git', 'add', 'P3'], cwd=markus_repo)
    check_call(['git', 'commit', '-m', 'Automatic push for submission'], cwd=markus_repo)

    # 5. Push to markus
    check_call(['git', 'push'], cwd=markus_repo)
