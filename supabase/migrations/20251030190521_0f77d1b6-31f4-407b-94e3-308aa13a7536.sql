-- Mettre à jour le rôle d'Abdenacer de 'admin' à 'owner'
UPDATE public.user_roles 
SET role = 'owner'::app_role
WHERE user_id = (
  SELECT id FROM public.profiles WHERE email = 'abdenacer.maredj@theultimateclosers.com'
);

-- Pour Naim : Ajouter comme owner si le profil existe
-- Si l'utilisateur n'existe pas encore, ce script ne fera rien (il doit d'abord s'inscrire)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'owner'::app_role
FROM public.profiles
WHERE email = 'naim.seghiri.marketing@theultimateclosers.com'
ON CONFLICT (user_id, role) DO UPDATE SET role = 'owner'::app_role;