import os
import shutil
from pathlib import Path
from subprocess import check_call
from tempfile import TemporaryDirectory

from serve import build

if __name__ == '__main__':
    # 1. Copy this repository to a temporary directory
    with TemporaryDirectory() as tempdir:
        tempdir = Path(tempdir) / 'root'
        shutil.copytree('.', tempdir)
        print(tempdir)

        # 2. Run the build function
        print("Building...")
        build(src=tempdir / 'src', dist=tempdir / 'P1')

        # 3. Delete "P1/*" in .gitignore
        gitignore = tempdir / '.gitignore'
        gitignore.write_text(gitignore.read_text('utf-8').replace('P1/*', ''), 'utf-8')
        
        # 4. Commit the built files in P1 to the repository
        check_call(['git', 'status'], cwd=tempdir)
        check_call(['git', 'add', 'P1'], cwd=tempdir)
        check_call(['git', 'commit', '-m', 'Build for submission'], cwd=tempdir)

        # 5. Push to markus
        check_call(['git', 'push', '--force', 'ssh://drprj@markus.teach.cs.toronto.edu/2024-01/csc309/group_2139.git', 'master'], cwd=tempdir)
