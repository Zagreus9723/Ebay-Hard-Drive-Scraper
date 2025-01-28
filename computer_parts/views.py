from django.shortcuts import render

# Create your views here.
def homepage(request):
    return render(request, 'computer_parts/home.html',{})

def hard_drives(request):
    localizations = [
        {"name": "Canada", "href": "/canada", "flag": "https://flagcdn.com/ca.svg"},
        {"name": "Canada (French)", "href": "/canada-french", "flag": "https://flagcdn.com/ca.svg"},
        {"name": "United States", "href": "/united-states", "flag": "https://flagcdn.com/us.svg"},
        {"name": "United Kingdom", "href": "/united-kingdom", "flag": "https://flagcdn.com/gb.svg"},
        {"name": "Germany", "href": "/germany", "flag": "https://flagcdn.com/de.svg"},
        {"name": "France", "href": "/france", "flag": "https://flagcdn.com/fr.svg"},
        {"name": "Italy", "href": "/italy", "flag": "https://flagcdn.com/it.svg"},
        {"name": "Spain", "href": "/spain", "flag": "https://flagcdn.com/es.svg"},
        {"name": "Australia", "href": "/australia", "flag": "https://flagcdn.com/au.svg"},
        {"name": "Netherlands", "href": "/netherlands", "flag": "https://flagcdn.com/nl.svg"},
        {"name": "Poland", "href": "/poland", "flag": "https://flagcdn.com/pl.svg"},
        {"name": "Belgium (Dutch)", "href": "/belgium-dutch", "flag": "https://flagcdn.com/be.svg"},
        {"name": "Belgium (French)", "href": "/belgium-french", "flag": "https://flagcdn.com/be.svg"},
        {"name": "Austria", "href": "/austria", "flag": "https://flagcdn.com/at.svg"},
        {"name": "Switzerland (German)", "href": "/switzerland-german", "flag": "https://flagcdn.com/ch.svg"},
        {"name": "Switzerland (French)", "href": "/switzerland-french", "flag": "https://flagcdn.com/ch.svg"},
        {"name": "Ireland", "href": "/ireland", "flag": "https://flagcdn.com/ie.svg"},
        {"name": "Malaysia", "href": "/malaysia", "flag": "https://flagcdn.com/my.svg"},
        {"name": "Singapore", "href": "/singapore", "flag": "https://flagcdn.com/sg.svg"},
        {"name": "Philippines", "href": "/philippines", "flag": "https://flagcdn.com/ph.svg"},
        {"name": "Hong Kong", "href": "/hong-kong", "flag": "https://flagcdn.com/hk.svg"},
        {"name": "China", "href": "/china", "flag": "https://flagcdn.com/cn.svg"},
        {"name": "Portugal", "href": "/portugal", "flag": "https://flagcdn.com/pt.svg"},
        {"name": "Belarus", "href": "/belarus", "flag": "https://flagcdn.com/by.svg"},
        {"name": "Kazakhstan", "href": "/kazakhstan", "flag": "https://flagcdn.com/kz.svg"},
        {"name": "Brazil", "href": "/brazil", "flag": "https://flagcdn.com/br.svg"},
        {"name": "Colombia", "href": "/colombia", "flag": "https://flagcdn.com/co.svg"},
        {"name": "Argentina", "href": "/argentina", "flag": "https://flagcdn.com/ar.svg"},
        {"name": "Bolivia", "href": "/bolivia", "flag": "https://flagcdn.com/bo.svg"},
        {"name": "Chile", "href": "/chile", "flag": "https://flagcdn.com/cl.svg"},
        {"name": "Costa Rica", "href": "/costa-rica", "flag": "https://flagcdn.com/cr.svg"},
        {"name": "Dominican Republic", "href": "/dominican-republic", "flag": "https://flagcdn.com/do.svg"},
        {"name": "Ecuador", "href": "/ecuador", "flag": "https://flagcdn.com/ec.svg"},
        {"name": "El Salvador", "href": "/el-salvador", "flag": "https://flagcdn.com/sv.svg"},
        {"name": "Guatemala", "href": "/guatemala", "flag": "https://flagcdn.com/gt.svg"},
        {"name": "Honduras", "href": "/honduras", "flag": "https://flagcdn.com/hn.svg"},
        {"name": "Uruguay", "href": "/uruguay", "flag": "https://flagcdn.com/uy.svg"}
    ]
    return render(request, 'computer_parts/english.html',{"localizations": localizations})