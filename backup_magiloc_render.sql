--
-- PostgreSQL database dump
--

\restrict VCzQBTJhl1Igh9SCt7ZGoE4g7bBMX0uPrxLT5aurNfI97m4VHxuMEuT5fl4CGNi

-- Dumped from database version 17.6 (Debian 17.6-1.pgdg12+1)
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: equipments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipments (
    id integer NOT NULL,
    designation character varying(200),
    cmu character varying(50),
    modele character varying(100),
    marque character varying(100),
    longueur character varying(50),
    infos_complementaires text,
    numero_serie character varying(100),
    statut character varying(50),
    debut_location character varying(50),
    fin_location_theorique character varying(50),
    rentree_le character varying(50),
    client character varying(200),
    numero_offre character varying(50),
    notes_location text,
    prix_ht_jour numeric(10,2),
    etat character varying(50),
    motif_maintenance text,
    certificat character varying(100),
    dernier_vgp character varying(50),
    prochain_vgp character varying(50),
    rentre_le character varying(50),
    note_retour text,
    debut_maintenance timestamp without time zone
);


--
-- Name: equipments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.equipments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: equipments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.equipments_id_seq OWNED BY public.equipments.id;


--
-- Name: location_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.location_history (
    id integer NOT NULL,
    equipment_id integer,
    client character varying(200),
    date_debut date,
    date_fin date,
    numero_offre character varying(100),
    notes_location text,
    prix_facture numeric(10,2),
    archived_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    date_retour_reel date,
    note_retour text,
    rentre_le character varying(50),
    duree_jours_ouvres integer,
    prix_ht_jour numeric(10,2),
    remise_ld boolean DEFAULT false,
    ca_total_ht numeric(10,2)
);


--
-- Name: location_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.location_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: location_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.location_history_id_seq OWNED BY public.location_history.id;


--
-- Name: locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.locations (
    id integer NOT NULL,
    equipment_id integer,
    client character varying(200),
    date_debut date,
    date_fin_theorique date,
    date_retour_reel date,
    numero_offre character varying(100),
    notes_location text,
    statut character varying(50) DEFAULT 'En cours'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: locations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.locations_id_seq OWNED BY public.locations.id;


--
-- Name: maintenance_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maintenance_history (
    id integer NOT NULL,
    equipment_id integer,
    date_entree timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    date_sortie timestamp without time zone,
    motif text,
    note_retour text,
    travaux_effectues text,
    cout_maintenance numeric(10,2),
    technicien character varying(100),
    archived_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    duree_jours integer
);


--
-- Name: maintenance_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.maintenance_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: maintenance_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.maintenance_history_id_seq OWNED BY public.maintenance_history.id;


--
-- Name: equipments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipments ALTER COLUMN id SET DEFAULT nextval('public.equipments_id_seq'::regclass);


--
-- Name: location_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location_history ALTER COLUMN id SET DEFAULT nextval('public.location_history_id_seq'::regclass);


--
-- Name: locations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations ALTER COLUMN id SET DEFAULT nextval('public.locations_id_seq'::regclass);


--
-- Name: maintenance_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_history ALTER COLUMN id SET DEFAULT nextval('public.maintenance_history_id_seq'::regclass);


--
-- Data for Name: equipments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.equipments (id, designation, cmu, modele, marque, longueur, infos_complementaires, numero_serie, statut, debut_location, fin_location_theorique, rentree_le, client, numero_offre, notes_location, prix_ht_jour, etat, motif_maintenance, certificat, dernier_vgp, prochain_vgp, rentre_le, note_retour, debut_maintenance) FROM stdin;
1265	PALAN MANUEL	1T	TEST EQUIP	TEST EQUIP	10M	\N	475986	Sur Parc	\N	\N	\N	\N	\N	\N	13.50	Neuf	\N	CML048798	\N	06/01/2026	\N	\N	\N
510	PALAN MANUEL	1T	SPM	LEVEX	3M		0817580	Sur Parc	2025-10-03	2025-10-09	\N	CLIENT TEST	458962	\N	13.89	Moyen	Retour Location, à vérifier	CML023487	02/01/2025	02/07/2025	2025-10-09		\N
550	PALAN MANUEL	5T	C21	PARSONS	8M	FICHE TECHNIQUE	16693	Sur Parc			\N				\N	Vieillissant		?				\N	\N
552	PALAN MANUEL	5T	C21	PARSONS	10M	FICHE TECHNIQUE	06902	Sur Parc			\N				\N	Moyen		CML010365				\N	\N
553	PALAN MANUEL	5T	C21	PARSONS	10M	FICHE TECHNIQUE	19989	Sur Parc			\N				\N	Moyen		CML023472				\N	\N
556	PALAN MANUEL	20T		REMA	6M		24947	Sur Parc			\N				\N	Moyen		CML023474				\N	\N
557	PALAN MANUEL	10T	C21	PARSONS	6M	FICHE TECHNIQUE	09012	Sur Parc			\N				\N	Vieillissant		CML048266				\N	\N
559	TIRFOR	3T5	TIRFOR T35	TRACTEL			7813	Sur Parc			\N				\N	Moyen		CML023404				\N	\N
560	GRIFFE A PROFILES	1T	SBC	LEVEX			0821388	Sur Parc			\N				\N	Moyen		?				\N	\N
561	PATIN ROULEUR	6T					1806	Sur Parc			\N				\N	Moyen		CML048264	16/09/2025	16/03/2026		\N	\N
562	PATIN ROULEUR	6T					1706	Sur Parc			\N				\N	Moyen		CML048261	16/09/2025	16/03/2026		\N	\N
563	POULIE RENVOI	25T	Poulie Ouvrante			CROCHET EMERILLON	1100995	Sur Parc			\N				\N	Vieillissant		?	09/09/2025	09/03/2026		\N	\N
564	POULIE RENVOI	25T	Poulie Ouvrante			CROCHET EMERILLON	120915	Sur Parc			\N				\N	Vieillissant		?	09/09/2025	09/03/2026		\N	\N
565	POULIE RENVOI	8T	Poulie Ouvrante			CROCHET EMERILLON	P08001	Sur Parc			\N				\N	Vieillissant		?	09/09/2025	09/03/2026		\N	\N
566	PESON	12.5T		TRACTEL		2 MANILLES 13T5	0605/038F	Sur Parc			\N				\N	Bon		AVHS2309303				\N	\N
567	PESON	25T	LLXh	TRACTEL		2 MANILLES 25T ; FICHE TECHNIQUE	1007001HB	Sur Parc			\N				\N	Bon		AVHS2407309				\N	\N
569	PESON	50T	LLX50	TRACTEL		2 MANILLES 55T	B4014	Sur Parc			\N				\N	Bon		AVHS2508303				\N	\N
570	POULIE RENVOI	2T	Poulie Ouvrante			CROCHET EMERILLON	2708	Sur Parc			\N				\N	Vieillissant		?	09/09/2025	09/03/2026		\N	\N
571	POULIE RENVOI	2T	Poulie Ouvrante			CROCHET EMERILLON	0607	Sur Parc			\N				\N	Moyen		?	09/09/2025	09/03/2026		\N	\N
573	PESON	5T	Dynamometre 1508003	REMA		2 MANILLES 6T5	17.0223	Sur Parc			\N				\N	Bon		AVHS 2508304	07/08/2025	07/02/2026		\N	\N
574	POULIE RENVOI	2T	Poulie Ouvrante			CROCHET EMERILLON	15?7	Sur Parc			\N				\N	Vieillissant	ATTNTION MATERIEL TRES VIEILLISSANT	?	09/09/2025	09/03/2026		\N	\N
576	PALAN A LEVIER	3T2	X-LINE	REMA	1M50		12713	Sur Parc			\N				\N	Bon		CML048067	19/09/2025	19/03/2026		\N	\N
577	PALAN A LEVIER	3T2	X-LINE	REMA	1M50		12722	Sur Parc			\N				\N	Bon		CML048068	19/09/2025	19/03/2026		\N	\N
578	PALAN A LEVIER	3T2	X-LINE	REMA	1M50		12723	Sur Parc			\N				\N	Bon		CML048069	19/09/2025	19/03/2026		\N	\N
594	TIRFOR	1T6	TIRFOR TU16	TRACTEL			8656	Sur Parc			\N				\N	Moyen		CML023412				\N	\N
596	TIRFOR	1T6	TIRFOR TU16	TRACTEL			6971	Sur Parc			\N				\N	Moyen		CML023417				\N	\N
597	VERIN HYDRAULIQUE	500KN	YLS-50/60	YALE		COURSE 60MM; FICHE TECHNIQUE	2409712	Sur Parc			\N				\N	Neuf			18/09/2025	18/03/2026		\N	\N
598	PESON	5T	Dynamometre 1508003	REMA		2 MANILLES 6T5	17.0226	Sur Parc			\N				\N	Bon		AVHS 2508305	13/08/2025	13/02/2026		\N	\N
516	PALAN MANUEL	1T	C21	PARSONS	5M	FICHE TECHNIQUE	40609	Sur Parc	2025-10-03	2025-11-13	\N	CLIENT TEST	\N	\N	13.89	Moyen	\N	CML023455	02/01/2025	02/07/2025	2025-11-13	\N	\N
512	PALAN MANUEL	1T	LIFT360	YALE	3M		HLCA-0737	Sur Parc	2025-10-04	2025-10-06	\N	CLIENT TEST	7548759	bab 10	\N	Bon	Retour Location, à vérifier	CML023483	31/01/2025	31/07/2025	2025-10-04	attention manque linguet	\N
513	PALAN MANUEL	1T	C21	PARSONS	6M	FICHE TECHNIQUE	52509	Sur Parc	2025-10-03	2025-10-09	\N	CLIENT TEST	\N	\N	13.89	Moyen	\N	CML023489	02/01/2025	02/07/2025	2025-10-16	\N	\N
515	PALAN ELECTRIQUE	3T	FA ELEPHANT	PARSONS	13M	TRIPHASE; FICHE TECHNIQUE	19011	Sur Parc	2025-10-06	2025-10-20	\N	CLIENT TEST	475986	BLABLA	\N	Vieillissant	Retour Location, à vérifier		20/08/2025	20/02/2026	2025-10-08	MANQUE PRISE	\N
603	PALAN ELECTRIQUE	2T	FA ELEPHANT	PARSONS	12M	TRIPHASE; FICHE TECHNIQUE	17044	Sur Parc			\N				\N	Moyen		CML048982				\N	\N
607	TREUIL ELECTRIQUE	500KG	MINIFOR TR50	TRACTEL		MONOPHASE ; 34KG ; FICHE TECHNIQUE	12210195A	Sur Parc			\N				\N	Moyen		CML048277				\N	\N
610	KIT MOUFLAGE			TRACTEL			35/19	Sur Parc			\N				\N	Bon			05/09/2025	05/03/2026		\N	\N
593	TIRFOR	3T2	TIRFOR T532D	TRACTEL			1502049	Sur Parc			\N				\N	Bon	\N	CML023403				\N	\N
736	KIT MOUFLAGE			FIXATOR			KITMOUF	Sur Parc			\N				\N	Bon			05/09/2025	05/03/2026		\N	\N
611	PALAN MANUEL	3T	C21	PARSONS	8M	FICHE TECHNIQUE	52433	Sur Parc			\N			EXPEDITION IA LE HAVRE	19.93	Moyen		CML023463	24/09/2025	24/03/2026		\N	\N
614	PATIN ROULEUR	6T					1206	Sur Parc			\N				\N	Moyen		CML048276	16/09/2025	16/03/2026		\N	\N
741	PALAN ELECTRIQUE	5T		HADEF	6M	TRIPHASE; 	HADEF5T	Sur Parc			\N				\N	Bon						\N	\N
615	PATIN ROULEUR	6T					1106	Sur Parc			\N				\N	Moyen		CML048276	16/09/2025	16/03/2026		\N	\N
616	PATIN ROULEUR	2T					1607	Sur Parc			\N				\N	Moyen		CML048279	16/09/2025	16/03/2026		\N	\N
872	DISTRI HYDRAULIQUE					2 SORTIES	2222DH	Sur Parc			\N				\N	Vieillissant			18/09/2025	18/03/2026		\N	\N
606	TREUIL ELECTRIQUE	300KG	MINIFOR TR30S	TRACTEL		MONOPHASE ; 34KG ; FICHE TECHNIQUE	12020034A	En Réservation	2025-10-06	2025-10-10	\N	CLIENT TEST	\N	\N	\N	Moyen		CML023416	17/09/2025	17/03/2026		\N	\N
509	PALAN ELECTRIQUE	2T	FA ELEPHANT	PARSONS	12M	TRIPHASE; FICHE TECHNIQUE	17060	En Réservation	2025-10-06	2025-10-13	\N	CLIENT TEST	\N	\N	51.84	Vieillissant	\N	CML048100	05/08/2025	05/02/2026	2025-10-06	\N	\N
572	PESON	5T	Dynamometre 1508003	REMA		2 MANILLES 6T5	17.0224	En Réservation	2025-10-06	2025-10-10	\N	CLIENT TEST	475896	Envoyer certificat par mail	\N	Bon		AVHS 2507302	31/07/2025	31/01/2026		\N	\N
521	TREUIL ELECTRIQUE	300KG	MINIFOR TR30	TRACTEL		MONOPHASE ; 17KG ; FICHE TECHNIQUE	090128	En Maintenance	22/09/2025	06/10/2025	\N	SDV		CABLE 10M;  BAB 10M	\N	Vieillissant	Retour Location, à vérifier	?			2025-10-03	popop	2025-10-04 19:19:55.750622
520	PALAN MANUEL	3T	K2	PARSONS	5M		230904	Sur Parc	\N	\N	\N	\N	\N	\N	\N	Moyen		CML023493				\N	\N
522	PALAN MANUEL	3T	C21	PARSONS	5M	FICHE TECHNIQUE	21681	Sur Parc	\N	\N	\N	\N	\N	\N	\N	Moyen		CML023470				\N	\N
524	PALAN MANUEL	1T	C21	PARSONS	10M	FICHE TECHNIQUE	40610	En Maintenance	27/08/2025	28/08/2025	\N	MEDIACO ATL	475009		13.89	Bon	Retour Location, à vérifier	CML023489	30/06/2025	30/12/2025	2025-10-03	RAS IMPECCABLE	2025-10-04 21:20:59.133645
526	PALAN MANUEL	1T	C21	PARSONS	10M	FICHE TECHNIQUE	40618	En Maintenance	27/08/2025	28/08/2025	\N	MEDIACO ATL	475009		13.89	Moyen	Retour Location, à vérifier	CML023457	30/06/2025	30/12/2025	2025-09-24		2025-10-04 21:29:31.183374
530	TREUIL ELECTRIQUE	3T	TE3000	HUCHEZ	185M	TRIPHASE ; D16 ; FICHE TECHNIQUE	122399	En Maintenance			\N				\N	Moyen	VGP A FAIRE	CML048961				\N	2025-10-05 07:24:26.232
523	PALAN MANUEL	3T	K2	PARSONS	5M		35857	Sur Parc	\N	\N	\N	\N	\N	\N	\N	Moyen		CML023491				\N	\N
525	PALAN MANUEL	1T	C21	PARSONS	10M	FICHE TECHNIQUE	86918	Sur Parc	\N	\N	\N	\N	\N	\N	13.89	Moyen		CML023460	02/01/2025	02/07/2025		\N	\N
528	PALAN MANUEL	1T	C21	PARSONS	10M	FICHE TECHNIQUE	40605	Sur Parc	\N	\N	\N	\N	\N	\N	13.89	Moyen		CML048268	02/01/2025	02/07/2025		\N	\N
532	PALAN MANUEL	2T	TRALIFT	TRACTEL	4M		118140	Sur Parc	\N	\N	\N	\N	\N	\N	\N	Vieillissant		?	31/01/2025	31/07/2025		\N	\N
529	PALAN ELECTRIQUE	3T	FA ELEPHANT	PARSONS	13M	TRIPHASE; FICHE TECHNIQUE	11155	En Location	2025-09-24	2025-10-02	\N	CLIENT TEST	\N	\N	\N	Vieillissant	\N	?	20/08/2025	20/02/2026		\N	\N
527	PALAN MANUEL	1T	C21	PARSONS	10M	FICHE TECHNIQUE	40621	En Maintenance	2025-10-01	2025-10-05	\N	CLIENT TEST	\N	\N	13.89	Moyen	Retour Location, à vérifier	CML023458	02/01/2025	02/07/2025	2025-10-06		2025-10-05 15:10:57.405424
533	PALAN MANUEL	2T	C21	PARSONS	5M	FICHE TECHNIQUE	06751	Sur Parc	\N	\N	\N	\N	\N	\N	\N	Vieillissant		CML023452				\N	\N
535	PALAN MANUEL	2T	C21	PARSONS	6M	FICHE TECHNIQUE	12726	Sur Parc	\N	\N	\N	\N	\N	\N	\N	Moyen		CML023492				\N	\N
534	PALAN MANUEL	2T	C21	PARSONS	10M	FICHE TECHNIQUE	62271	En Maintenance			\N				\N	Moyen	dsds	CML023500	28/02/2025	28/08/2025		\N	2025-10-05 08:15:28.118
536	PALAN MANUEL	2T	C21	PARSONS	5M	FICHE TECHNIQUE	06748	En Maintenance	2025-10-01	2025-10-03	\N	CLIENT TEST	\N	\N	\N	Moyen	Retour Location, à vérifier	CML023454	22/05/2025	22/11/2025	2025-10-03	RAR OK	2025-10-05 17:30:15.955573
531	TREUIL ELECTRIQUE	5T	TE5000	HUCHEZ	160M	TRIPHASE ; D18 ; FICHE TECHNIQUE	145862	Sur Parc	\N	\N	\N	\N	\N	\N	\N	Bon	\N	CML048962				\N	\N
541	TREUIL ELECTRIQUE	1T6	TE1600	HUCHEZ	160M	TRIPHASE ; D12 ; 455KG; FICHE TECHNIQUE	151088	Sur Parc	2025-10-01	2025-10-03	\N	CLIENT TEST	\N	\N	\N	Bon	\N	CML048065	21/08/2025	21/02/2026	2025-10-03	\N	\N
537	PALAN MANUEL	2T	C21	PARSONS	8M	FICHE TECHNIQUE	32900	Sur Parc			\N				\N	Moyen		CML023495				\N	\N
538	PALAN MANUEL	3T	C21	PARSONS	10M	FICHE TECHNIQUE	88453	Sur Parc			\N				\N	Moyen		CML023462	25/09/2025	25/03/2026		\N	\N
539	PALAN MANUEL	2T	C21	PARSONS	12M	FICHE TECHNIQUE	98914	Sur Parc			\N				\N	Moyen		CML023499				\N	\N
540	PALAN MANUEL	2T	C21	PARSONS	8M	FICHE TECHNIQUE	32901	Sur Parc			\N				\N	Moyen		CML023497				\N	\N
543	PALAN MANUEL	3T	C21	PARSONS	10M	FICHE TECHNIQUE	30230	Sur Parc			\N				\N	Moyen		CML023468	25/09/2025	25/03/2026		\N	\N
545	TIRFOR	1T6	TIRFOR TU16	TRACTEL			4801	Sur Parc			\N				\N	Vieillissant		CML023422	19/08/2025	19/02/2026		\N	\N
546	PALAN MANUEL	3T	C21	PARSONS	10M	FICHE TECHNIQUE	88450	Sur Parc			\N				19.93	Moyen		CML043701	30/04/2025	30/10/2025		\N	\N
568	PESON	50T	LLX50	TRACTEL		2 MANILLES 55T	H03070	Sur Parc			\N				\N	Bon		AVHS2507303				\N	\N
542	PALAN MANUEL	3T	C21	PARSONS	8M	FICHE TECHNIQUE	30231	En Location	25/09/2025		\N	IA LE HAVRE		EXPEDITION IA LE HAVRE	19.93	Moyen		CML047473	19/08/2025	19/02/2026		\N	\N
544	PALAN MANUEL	3T	C21	PARSONS	8M	FICHE TECHNIQUE	30236	En Location	25/09/2025		\N	IA LE HAVRE		EXPEDITION IA LE HAVRE	19.93	Moyen		CML043704	30/04/2025	30/10/2025		\N	\N
517	PALAN MANUEL	3T	C21	PARSONS	3M	FICHE TECHNIQUE	63318	En Location	2025-10-01	2025-10-03	\N	CLIENT TEST	\N	\N	\N	Moyen	\N	CML023498			2025-10-13	\N	\N
519	TREUIL ELECTRIQUE	300KG	FIXATOR LM 300+	FIXATOR		MONOPHASE ; 34KG ; FICHE TECHNIQUE	1943	En Maintenance	2025-10-06	2025-10-21	\N	CLIENT TEST	\N	\N	\N	Neuf	Retour Location, à vérifier	CML048980	22/09/2025	22/03/2026	2025-10-07	ATTENTION PRISE	2025-10-05 09:07:09.781552
551	PALAN MANUEL	5T	C21	PARSONS	6M	FICHE TECHNIQUE	01663	En Location	22/09/2025	30/09/2025	\N	TK ELEVATOR			\N	Moyen		CML023465				\N	\N
554	PALAN MANUEL	10T	C21	PARSONS	10M	FICHE TECHNIQUE	04595	En Location	25/09/2025		\N	IA LE HAVRE		EXPEDITION IA LE HAVRE	\N	Vieillissant		CML023478				\N	\N
555	PALAN MANUEL	10T	C21	PARSONS	10M	FICHE TECHNIQUE	04592	En Location	25/09/2025		\N	IA LE HAVRE		EXPEDITION IA LE HAVRE	\N	Vieillissant		CML010365				\N	\N
599	TREUIL ELECTRIQUE	5T	TE5000	HUCHEZ	160M	TRIPHASE ; D18 ; FICHE TECHNIQUE	148035	En Location	08/07/2025	31/12/2025	\N	SADE	473456	CAUTION 5K MR SEZESTRE 0620724491	\N	Bon		?				\N	\N
547	TREUIL ELECTRIQUE	3T	TE3000	HUCHEZ	185M	TRIPHASE ; D16 ; FICHE TECHNIQUE	122398	Sur Parc	21/07/2025	11/08/2025	\N	BOUYGUES ES	474543	M. NOBLET 0660192922	\N	Bon	\N	CML048963			23/09/2025	\N	\N
511	PALAN MANUEL	0T5	LIFT360	YALE	3M		02131247	Sur Parc	2025-10-03	2025-10-08	\N	CLIENT TEST	\N	\N	\N	Bon	Retour Location, à vérifier	CML023486	31/01/2025	31/07/2025	2025-10-08		\N
518	PALAN MANUEL	3T	C21	PARSONS	4M	FICHE TECHNIQUE	77144	En Maintenance	2025-10-06	2025-10-06	\N	CLIENT TEST	\N	\N	\N	Moyen	Retour Location, à vérifier	CML023496			2025-10-06	RAR	2025-10-05 07:52:10.983624
595	TIRFOR	1T6	TIRFOR TU16	TRACTEL			5468	Sur Parc			\N				\N	Moyen	\N	CML023430				\N	\N
548	TREUIL ELECTRIQUE	500KG	MINIFOR TR50	TRACTEL		MONOPHASE ; 34KG ; FICHE TECHNIQUE	0778A01	Sur Parc			\N				\N	Moyen	RETOUR LOC A TESTER	CML023408	25/08/2025	25/02/2026		\N	\N
549	TIRFOR	3T2	TIRFOR T532D	TRACTEL			395503	Sur Parc			\N				\N	Bon		CML023402				\N	\N
558	POULIE RENVOI	2T	Poulie Ouvrante	DELTA		MANILLE LYRE BOULON	4136	En Location	10/09/2025	19/09/2025	\N	MABRIS	475138	EXPEDITION	\N	Moyen		?	09/09/2025	09/03/2026		\N	\N
579	PALAN A LEVIER	3T2	X-LINE	REMA	1M50		12697	Sur Parc			\N				\N	Bon		CML048066	19/09/2025	19/03/2026		\N	\N
580	PALAN A LEVIER	1T6	ELEPHANT	PARSONS	1M50		11085	Sur Parc			\N				\N	Moyen		CML048265	19/09/2025	19/03/2026		\N	\N
600	CHARIOT PP	1T	SELECT 211	REMA			26992-5767	En Location	10/09/2025	19/09/2025	\N	MABRIS	475138	EXPEDITION	\N	Moyen		CML048003	19/09/2025	19/03/2026		\N	\N
581	POULIE RENVOI	2T	Poulie Ouvrante			CROCHET EMERILLON	0513	Sur Parc			\N				\N	Vieillissant		?	09/09/2025	09/03/2026		\N	\N
604	TREUIL ELECTRIQUE	300KG	MINIFOR TR30S	TRACTEL		MONOPHASE ; 34KG ; FICHE TECHNIQUE	12020064A	En Location	26/06/2025	29/08/2025	\N	JUIGNET	474229	M. MOREAU 0670964194	\N	Moyen		?	04/09/2025	04/03/2026		\N	\N
605	TREUIL ELECTRIQUE	300KG	MINIFOR TR30S	TRACTEL		MONOPHASE ; 34KG ; FICHE TECHNIQUE	0344	En Location	26/09/2025	01/10/2025	\N	MEDIACO ATL	475560		\N	Moyen		CML048070	04/09/2025	04/03/2026		\N	\N
608	TREUIL ELECTRIQUE	500KG	MINIFOR TR50	TRACTEL		MONOPHASE ; 34KG; FICHE TECHNIQUE	11060035A	En Location	10/09/2025	19/09/2025	\N	MABRIS	475138	EXPEDITION	\N	Moyen		CML023080	31/07/2025	31/01/2026		\N	\N
609	TREUIL ELECTRIQUE	500KG	FIXATOR LM 500+	FIXATOR		MONOPHASE ; 34KG ; FICHE TECHNIQUE	1976	En Location	29/09/2025	03/10/2025	\N	TECKNILEV	475627		\N	Neuf		?	22/09/2025	22/03/2026		\N	\N
582	POULIE RENVOI	1T	Poulie Ouvrante			CROCHET EMERILLON	0701	Sur Parc			\N				\N	Moyen		?	09/09/2025	09/03/2026		\N	\N
583	POULIE RENVOI	1T	Poulie Ouvrante			CROCHET EMERILLON	0116	Sur Parc			\N				\N	Vieillissant		?	09/09/2025	09/03/2026		\N	\N
584	GRIFFE A PROFILES	1T	SBC	LEVEX			11110723	Sur Parc			\N				\N	Moyen		?				\N	\N
602	PALAN ELECTRIQUE	1T	FA ELEPHANT	PARSONS	24M	TRIPHASE; FICHE TECHNIQUE; ORIGINE 2T 12M	12334	En Maintenance	2025-10-03	\N	\N	TECKNILEV	\N	\N	\N	Moyen	Retour Location, à vérifier	CML048983	23/09/2025	23/03/2026	2025-10-04	ras	\N
585	POULIE RENVOI	1T	Poulie Ouvrante			CROCHET EMERILLON	0515	Sur Parc			\N				\N	Vieillissant		?	09/09/2025	09/03/2026		\N	\N
586	POULIE RENVOI	4T	Poulie Ouvrante	DELTA		MANILLE LYRE BOULON	4359	Sur Parc			\N				\N	Bon		?	09/09/2025	09/03/2026		\N	\N
587	POULIE RENVOI	2T	Poulie Ouvrante	DELTA		MANILLE LYRE BOULON	4086	Sur Parc			\N				\N	Moyen		?	09/09/2025	09/03/2026		\N	\N
588	POULIE RENVOI	2T	Poulie Ouvrante	DELTA		MANILLE LYRE BOULON	4024	Sur Parc			\N				\N	Moyen		?	09/09/2025	09/03/2026		\N	\N
589	PALAN MANUEL	3T	C21	PARSONS	10M	FICHE TECHNIQUE	30228	Sur Parc			\N				\N	Moyen		CML047465	24/09/2025	24/03/2026		\N	\N
590	TIRFOR	3T2	TIRFOR T532D	TRACTEL			6086	Sur Parc			\N				\N	Bon		CML023407				\N	\N
591	TIRFOR	3T2	TIRFOR T532D	TRACTEL			1512050	Sur Parc			\N				\N	Bon		CML023401	31/07/2025	31/01/2026		\N	\N
592	TIRFOR	3T2	TIRFOR T532D	TRACTEL			395603	Sur Parc			\N				\N	Moyen		CML023423	31/07/2025	31/01/2026		\N	\N
601	PALAN ELECTRIQUE	1T	FA ELEPHANT	PARSONS	10M	TRIPHASE; FICHE TECHNIQUE	12333	Sur Parc			\N				\N	Moyen		CML048981				\N	\N
612	TREUIL ELECTRIQUE	800KG	TRC803	HUCHEZ	50M	TRIPHASE ; D9 ; 120KG ; FICHE TECHNIQUE	1580245	En Location	18/09/2025	20/10/2025	\N	TECKNILEV	475389		\N	Moyen		CML048285	29/08/2025	28/02/2026		\N	\N
613	POULIE RENVOI	4T	Poulie Ouvrante	DELTA		MANILLE LYRE BOULON	4267	En Location	04/09/2025	05/09/2025	\N	VULCA OUEST			\N	Bon		?	04/09/2025	04/03/2026		\N	\N
514	TIRFOR	1T6	TIRFOR TU16	TRACTEL			2222	Sur Parc	2025-10-06	2025-10-06	\N	CLIENT TEST	475896	C'EST GÉNIAL CA FONCTIONNE !	\N	Moyen	\N	CML023420	19/08/2025	19/02/2026	2025-10-02	\N	\N
617	PATIN ROULEUR	2T					1507	Sur Parc			\N				\N	Moyen		CML048278	16/09/2025	16/03/2026		\N	\N
618	PATIN ROULEUR	2T					1707	Sur Parc			\N				\N	Moyen		CML048280	16/09/2025	16/03/2026		\N	\N
620	VERIN HYDRAULIQUE	200KN	YLS-20/45	YALE		COURSE 45MM; FICHE TECHNIQUE	2405272	Sur Parc			\N				\N	Neuf			18/09/2025	18/03/2026		\N	\N
621	VERIN HYDRAULIQUE	100KN	?	?		?	4643	Sur Parc			\N				\N	Moyen			18/09/2025	18/03/2026		\N	\N
622	VERIN HYDRAULIQUE	200KN	YLS-20/45	YALE		COURSE 45MM; FICHE TECHNIQUE	2405203	Sur Parc			\N				\N	Neuf			18/09/2025	18/03/2026		\N	\N
623	VERIN HYDRAULIQUE	200KN	YLS-20/45	YALE		COURSE 45MM; FICHE TECHNIQUE	2405288	Sur Parc			\N				\N	Neuf			18/09/2025	18/03/2026		\N	\N
624	VERIN HYDRAULIQUE	500KN	YLS-50/60	YALE		COURSE 60MM; FICHE TECHNIQUE	2409734	Sur Parc			\N				\N	Neuf			18/09/2025	18/03/2026		\N	\N
625	VERIN HYDRAULIQUE	500KN	YLS-50/60	YALE		COURSE 60MM; FICHE TECHNIQUE	2409750	Sur Parc			\N				\N	Neuf			18/09/2025	18/03/2026		\N	\N
626	VERIN HYDRAULIQUE	200KN	YLS-20/45	YALE		COURSE 45MM; FICHE TECHNIQUE	2405311	Sur Parc			\N				\N	Neuf			18/09/2025	18/03/2026		\N	\N
627	VERIN HYDRAULIQUE	500KN	YLS-50/60	YALE		COURSE 60MM; FICHE TECHNIQUE	2409718	Sur Parc			\N				\N	Neuf			18/09/2025	18/03/2026		\N	\N
628	POTENCE ECHAFFAUDAGE	500KG	TCP	FIXATOR		FICHE TECHNIQUE	220383/7	Sur Parc			\N				\N	Neuf		CML048992	22/09/2025	22/03/2026		\N	\N
629	POTENCE ECHAFFAUDAGE	500KG	TCP	FIXATOR		FICHE TECHNIQUE	220383/8	Sur Parc			\N				\N	Neuf		CML048991	22/09/2025	22/03/2026		\N	\N
630	PATIN ROULEUR	2T					1087	Sur Parc			\N				\N	Moyen		CML048269	16/09/2025	16/03/2026		\N	\N
631	VERIN HYDRAULIQUE	1050KN	SE VERIN BAS			COURSE 60MM; FICHE TECHNIQUE 	4844	Sur Parc			\N				\N	Moyen			18/09/2025	18/03/2026		\N	\N
632	CHARIOT PP	1T	SELECT 211	REMA			26992-6776	Sur Parc			\N				\N	Moyen		CML048975				\N	\N
633	CHARIOT PP	5T		LEVEX			14110333	Sur Parc			\N				\N	Bon		CML047184				\N	\N
\.


--
-- Data for Name: location_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.location_history (id, equipment_id, client, date_debut, date_fin, numero_offre, notes_location, prix_facture, archived_at, date_retour_reel, note_retour, rentre_le, duree_jours_ouvres, prix_ht_jour, remise_ld, ca_total_ht) FROM stdin;
5	511	CLIENT TEST	2025-10-03	2025-10-08	\N	\N	\N	2025-10-02 19:37:51.477682	2025-10-08		2025-10-08	4	\N	f	\N
6	515	CLIENT TEST	2025-10-06	2025-10-20	475986	BLABLA	\N	2025-10-03 19:49:46.254509	2025-10-08	MANQUE PRISE	2025-10-08	3	\N	f	\N
7	519	CLIENT TEST	2025-10-06	2025-10-20	457896	JHJHJUH	\N	2025-10-04 10:53:25.751649	2025-10-03	Problème de prise	2025-10-03	\N	\N	\N	\N
8	602	TECKNILEV	2025-10-03	\N	\N	\N	\N	2025-10-04 10:56:31.18302	2025-10-04	ras	2025-10-04	1	\N	f	\N
9	512	CLIENT TEST	2025-10-04	2025-10-06	7548759	bab 10	\N	2025-10-04 14:18:33.721304	2025-10-04	attention manque linguet	2025-10-04	0	\N	f	\N
10	517	CLIENT TEST	2025-10-01	2025-10-03	545455	\N	\N	2025-10-04 14:34:30.863909	2025-10-03	MANQUE CABLE	2025-10-03	3	\N	f	\N
11	521	SDV	2025-09-22	2025-10-06		CABLE 10M;  BAB 10M	\N	2025-10-04 19:19:55.750622	2025-10-03	popop	2025-10-03	10	\N	f	\N
12	524	MEDIACO ATL	2025-08-27	2025-08-28	475009		\N	2025-10-04 21:20:59.133645	2025-10-03	RAS IMPECCABLE	2025-10-03	28	13.89	t	311.14
13	526	MEDIACO ATL	2025-08-27	2025-08-28	475009		\N	2025-10-04 21:29:31.183374	2025-09-24		2025-09-24	21	13.89	t	233.35
14	518	CLIENT TEST	2025-10-06	2025-10-06	\N	\N	\N	2025-10-05 07:52:10.983624	2025-10-06	RAR	2025-10-06	1	\N	f	\N
15	517	CLIENT TEST	2025-10-06	2025-10-13	\N	\N	\N	2025-10-05 08:57:27.494632	2025-10-13		2025-10-13	6	\N	f	\N
16	519	CLIENT TEST	2025-10-06	2025-10-21	\N	\N	\N	2025-10-05 09:07:09.781552	2025-10-07	ATTENTION PRISE	2025-10-07	2	\N	f	\N
23	527	CLIENT TEST	2025-10-01	2025-10-05	\N	\N	\N	2025-10-05 15:10:57.405424	2025-10-06		2025-10-06	4	13.89	f	55.56
24	536	CLIENT TEST	2025-10-01	2025-10-03	\N	\N	\N	2025-10-05 17:30:15.955573	2025-10-03	RAR OK	2025-10-03	3	\N	f	\N
25	541	CLIENT TEST	2025-10-01	2025-10-03	\N	\N	\N	2025-10-05 17:32:01.103627	2025-10-03	RAS TOP	2025-10-03	3	\N	f	\N
26	509	CLIENT TEST	2025-10-03	2025-10-10	748965	Prise 32A à fournir	\N	2025-10-05 21:18:25.920655	2025-10-06	Problème BAB	2025-10-06	2	51.84	f	103.68
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.locations (id, equipment_id, client, date_debut, date_fin_theorique, date_retour_reel, numero_offre, notes_location, statut, created_at) FROM stdin;
\.


--
-- Data for Name: maintenance_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.maintenance_history (id, equipment_id, date_entree, date_sortie, motif, note_retour, travaux_effectues, cout_maintenance, technicien, archived_at, duree_jours) FROM stdin;
1	514	2025-10-02 15:32:55.687404	\N	Retour Location, à vérifier	Juste test en charge à effectuer	\N	\N	\N	2025-10-02 15:32:55.687404	\N
2	510	2025-10-02 18:15:13.336206	\N	Retour Location, à vérifier		\N	\N	\N	2025-10-02 18:15:13.336206	\N
3	516	2025-10-02 18:21:03.155289	\N	Retour Location, à vérifier		\N	\N	\N	2025-10-02 18:21:03.155289	\N
4	513	2025-10-02 18:29:09.66519	\N	Retour Location, à vérifier		\N	\N	\N	2025-10-02 18:29:09.66519	\N
5	511	2025-10-02 19:37:51.477682	\N	Retour Location, à vérifier		\N	\N	\N	2025-10-02 19:37:51.477682	\N
6	515	2025-10-03 19:49:46.254509	\N	Retour Location, à vérifier	MANQUE PRISE	\N	\N	\N	2025-10-03 19:49:46.254509	\N
7	519	2025-10-04 10:53:25.751649	\N	Retour Location, à vérifier	Problème de prise	\N	\N	\N	2025-10-04 10:53:25.751649	\N
8	602	2025-10-04 10:56:31.18302	\N	Retour Location, à vérifier	ras	\N	\N	\N	2025-10-04 10:56:31.18302	\N
9	512	2025-10-04 14:18:33.721304	\N	Retour Location, à vérifier	attention manque linguet	\N	\N	\N	2025-10-04 14:18:33.721304	\N
10	517	2025-10-04 14:34:30.863909	\N	Retour Location, à vérifier	MANQUE CABLE	\N	\N	\N	2025-10-04 14:34:30.863909	\N
11	521	2025-10-04 19:19:55.750622	\N	Retour Location, à vérifier	popop	\N	\N	\N	2025-10-04 19:19:55.750622	\N
12	524	2025-10-04 21:20:59.133645	\N	Retour Location, à vérifier	RAS IMPECCABLE	\N	\N	\N	2025-10-04 21:20:59.133645	\N
13	526	2025-10-04 21:29:31.183374	\N	Retour Location, à vérifier		\N	\N	\N	2025-10-04 21:29:31.183374	\N
14	518	2025-10-05 07:52:10.983624	\N	Retour Location, à vérifier	RAR	\N	\N	\N	2025-10-05 07:52:10.983624	\N
15	517	2025-10-05 08:57:27.494632	\N	Retour Location, à vérifier		\N	\N	\N	2025-10-05 08:57:27.494632	\N
16	519	2025-10-05 09:07:09.781552	\N	Retour Location, à vérifier	ATTENTION PRISE	\N	\N	\N	2025-10-05 09:07:09.781552	\N
17	527	2025-10-05 15:10:57.405424	\N	Retour Location, à vérifier		\N	\N	\N	2025-10-05 15:10:57.405424	\N
18	517	2025-10-05 00:00:00	2025-10-05 00:00:00	Retour Location, à vérifier	\N	\N	\N	\N	2025-10-05 15:11:06.811556	1
19	536	2025-10-05 17:30:15.955573	\N	Retour Location, à vérifier	RAR OK	\N	\N	\N	2025-10-05 17:30:15.955573	\N
20	541	2025-10-05 17:32:01.103627	\N	Retour Location, à vérifier	RAS TOP	\N	\N	\N	2025-10-05 17:32:01.103627	\N
21	541	2025-10-05 00:00:00	2025-10-05 00:00:00	Retour Location, à vérifier	RAS TOP	\N	\N	\N	2025-10-05 17:32:47.365172	1
22	509	2025-10-05 00:00:00	2025-10-05 00:00:00	Retour Location, à vérifier	Problème BAB	\N	\N	\N	2025-10-05 21:20:11.18811	1
23	531	2025-10-05 00:00:00	2025-10-05 00:00:00	ARBRE SORTIE MOTEUR A CHANGER	\N	\N	\N	\N	2025-10-05 21:28:44.930915	1
24	531	2025-10-05 00:00:00	2025-10-05 00:00:00	arbre à changer	\N	\N	\N	\N	2025-10-05 21:29:35.057237	1
\.


--
-- Name: equipments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.equipments_id_seq', 1265, true);


--
-- Name: location_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.location_history_id_seq', 26, true);


--
-- Name: locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.locations_id_seq', 1, false);


--
-- Name: maintenance_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.maintenance_history_id_seq', 24, true);


--
-- Name: equipments equipments_numero_serie_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipments
    ADD CONSTRAINT equipments_numero_serie_key UNIQUE (numero_serie);


--
-- Name: equipments equipments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipments
    ADD CONSTRAINT equipments_pkey PRIMARY KEY (id);


--
-- Name: location_history location_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location_history
    ADD CONSTRAINT location_history_pkey PRIMARY KEY (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: maintenance_history maintenance_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_history
    ADD CONSTRAINT maintenance_history_pkey PRIMARY KEY (id);


--
-- Name: idx_equipments_numero_serie; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipments_numero_serie ON public.equipments USING btree (numero_serie);


--
-- Name: idx_equipments_statut; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipments_statut ON public.equipments USING btree (statut);


--
-- Name: idx_location_history_ca_total; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_location_history_ca_total ON public.location_history USING btree (ca_total_ht);


--
-- Name: idx_location_history_date_debut; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_location_history_date_debut ON public.location_history USING btree (date_debut);


--
-- Name: idx_location_history_equipment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_location_history_equipment_id ON public.location_history USING btree (equipment_id);


--
-- Name: idx_location_history_remise_ld; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_location_history_remise_ld ON public.location_history USING btree (remise_ld);


--
-- Name: idx_locations_equipment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_locations_equipment_id ON public.locations USING btree (equipment_id);


--
-- Name: idx_maintenance_history_date_entree; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_maintenance_history_date_entree ON public.maintenance_history USING btree (date_entree);


--
-- Name: idx_maintenance_history_equipment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_maintenance_history_equipment_id ON public.maintenance_history USING btree (equipment_id);


--
-- Name: maintenance_history maintenance_history_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_history
    ADD CONSTRAINT maintenance_history_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipments(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict VCzQBTJhl1Igh9SCt7ZGoE4g7bBMX0uPrxLT5aurNfI97m4VHxuMEuT5fl4CGNi

