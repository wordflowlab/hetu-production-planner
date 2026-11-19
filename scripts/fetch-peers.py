"""只下载并核验联合验收的固定运行包，不执行其安装脚本。"""
from pathlib import Path
import subprocess,json,hashlib,struct,tarfile
root=Path.cwd();lock=json.loads((root/'peer-lock.json').read_text());out=root/'output/peers';out.mkdir(parents=True,exist_ok=True)
def digest(p):
 h=hashlib.sha256()
 for f in sorted(p.rglob('*'),key=lambda f:f.relative_to(p).as_posix().encode()):
  assert not f.is_symlink()
  if f.is_file():n=f.relative_to(p).as_posix().encode();b=f.read_bytes();h.update(struct.pack('>IQ',len(n),len(b))+n+b)
 return h.hexdigest()
for peer in lock['peers']:
 dest=out/peer['slug']/peer['version'];dest.mkdir(parents=True,exist_ok=True);name='org.wordflowlab.'+peer['slug']+'-'+peer['version']+'.tgz';archive=dest/name
 if not archive.exists():subprocess.run(['gh','release','download','v'+peer['version'],'--repo','wordflowlab/hetu-'+peer['slug'],'--pattern',name,'--dir',str(dest)],check=True)
 assert hashlib.sha256(archive.read_bytes()).hexdigest()==peer['archive_sha256'],'同一版本归档已变化'
 package=dest/'package'
 if not package.exists():
  package.mkdir()
  with tarfile.open(archive) as source:
   for m in source.getmembers():assert not m.issym() and not m.islnk() and (package/m.name).resolve().is_relative_to(package)
   source.extractall(package,filter='data')
 assert digest(package)==peer['package_sha256'],'固定联合运行包摘要不符'
 print(peer['slug'],peer['package_sha256'],flush=True)
