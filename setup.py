from icemet_web import version

from setuptools import setup, find_packages

with open("README.md") as fp:
	readme = fp.read()

with open("requirements.txt") as fp:
	requirements = fp.read().splitlines()

setup(
	name="icemet-web",
	version=version,
	packages=find_packages(),
	
	install_requires=requirements,
	
	package_data={"icemet_web": ["data/*", "static/*/*"]},
	
	author="Eero Molkoselkä",
	author_email="eero.molkoselka@gmail.com",
	description="ICEMET web interface",
	long_description=readme,
	url="https://github.com/molkoback/icemet-web",
	license="MIT",
	
	entry_points={
		"console_scripts": [
			"icemet-web-run = icemet_web.scripts.run:main"
		]
	},
	
	classifiers=[
		"License :: OSI Approved :: MIT License",
		"Operating System :: OS Independent",
		"Programming Language :: Python :: 3",
		"Topic :: Scientific/Engineering :: Atmospheric Science",
	]
)
