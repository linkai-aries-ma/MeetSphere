import os
import shutil
from pathlib import Path
from subprocess import check_call
from tempfile import TemporaryDirectory

from serve import build

if __name__ == '__main__':
    markus_repo = "ssh://drprj@markus.teach.cs.toronto.edu/2024-01/csc309/group_2139.git"
    repo_path = Path(__file__).parent.parent / 'markus'

    # 1. Clone the markus repository if it doesn't exist
    if not repo_path.exists():
        check_call(['git', 'clone', markus_repo, repo_path])

    # 2. Run a clean build
    print("Building...")
    build(clean=True)

    # 3. Override the built files (P1) to the markus repository
    print("Overriding...")
    p1_dir = repo_path / 'P1'
    if p1_dir.exists():
        shutil.rmtree(p1_dir)

    shutil.copytree('../../P1', p1_dir)

    # 4. Pack git source of the current repository into the markus repository
    print("Packing...")
    check_call(['git', 'archive', '--format=zip', '-o', p1_dir / 'source.zip', 'HEAD'])

    # 4. Commit the built files in P1 to the repository
    check_call(['git', 'status'], cwd=repo_path)
    check_call(['git', 'add', 'P1'], cwd=repo_path)
    check_call(['git', 'commit', '-m', 'Automatic build for submission'], cwd=repo_path)

    # 5. Push to markus
    check_call(['git', 'push'], cwd=repo_path)
