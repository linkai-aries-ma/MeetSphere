import os
import shutil
from pathlib import Path
from subprocess import check_call

if __name__ == '__main__':
    markus_url = "ssh://drprj@markus.teach.cs.toronto.edu/2024-01/csc309/group_2139.git"
    markus_repo = Path(__file__).parent.parent / 'markus2'
    this_repo = Path(__file__).parent

    # 1. Clone the markus repository if it doesn't exist
    if not markus_repo.exists():
        check_call(['git', 'clone', markus_url, markus_repo])

    # 2. Override P2 files to the markus repository
    print("Overriding...")
    p2_dir = markus_repo / 'P2'
    if p2_dir.exists():
        shutil.rmtree(p2_dir)

    shutil.copytree(this_repo, p2_dir / 'OneOnOne', ignore=shutil.ignore_patterns(
        *[l for l in Path(this_repo / '.gitignore').read_text().split('\n')
          if l.strip() != '' and not l.startswith('#')] + ['.git']
    ))

    # 3. Add startup.sh, run.sh, and docs.pdf
    shutil.copy(this_repo / 'docs/main.pdf', p2_dir / 'docs.pdf')
    Path(p2_dir / 'startup.sh').write_text("""
#!/usr/bin/env bash

cd OneOnOne
bash startup.sh
""".strip())
    Path(p2_dir / 'run.sh').write_text("""
#!/usr/bin/env bash

cd OneOnOne
bash run.sh
""".strip())

    # 4. Commit the built files in P1 to the repository
    check_call(['git', 'status'], cwd=markus_repo)
    check_call(['git', 'add', 'P2'], cwd=markus_repo)
    check_call(['git', 'commit', '-m', 'Automatic push for submission'], cwd=markus_repo)

    # 5. Push to markus
    # check_call(['git', 'push'], cwd=markus_repo)
