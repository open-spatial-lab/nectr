select t0."use_no", t1."chem_code", t1."chemname", sum(t0."lbs_chm_used"), t0."comtrs" from 's3://wby-fm-bucket-2e6c834/8litczsae-udc2020.parquet' as t0 left join 's3://wby-fm-bucket-2e6c834/8litdjhb8-chemical.parquet' as t1 on t0."chem_code" = t1."chem_code" group by "t0"."comtrs";


select * from 's3://wby-fm-bucket-2e6c834/8litczsae-udc2020.parquet' as t0 left join 's3://wby-fm-bucket-2e6c834/8litdjhb8-chemical.parquet' as t1 on t0."chem_code" = t1."chem_code" LIMIT 5;
select t0."use_no", t0."prodno", t1."chemname" from 's3://wby-fm-bucket-2e6c834/8litczsae-udc2020.parquet' as t0 left join 's3://wby-fm-bucket-2e6c834/8litdjhb8-chemical.parquet' as t1 on t0."chem_code" = t1."chem_code" WHERE t1."chemname" = 'SULFUR' LIMIT 5;

select sum(t0."lbs_chm_used"), t0."comtrs" from 's3://wby-fm-bucket-2e6c834/8litczsae-udc2020.parquet' as t0 left join 's3://wby-fm-bucket-2e6c834/8litdjhb8-chemical.parquet' as t1 on t0."chem_code" = t1."chem_code" WHERE t1."chemname" = 'SULFUR' GROUP BY t0."comtrs" LIMIT 5;
select sum(t0."lbs_chm_used"), t0."comtrs" from 's3://wby-fm-bucket-2e6c834/8litczsae-udc2020.parquet' as t0 left join 's3://wby-fm-bucket-2e6c834/8litdjhb8-chemical.parquet' as t1 on t0."chem_code" = t1."chem_code" WHERE t1."chemname" = 'SULFUR' GROUP BY t0."comtrs";
select sum(t0."lbs_chm_used"), t0."county_cd" from 's3://wby-fm-bucket-2e6c834/8litczsae-udc2020.parquet' as t0 left join 's3://wby-fm-bucket-2e6c834/8litdjhb8-chemical.parquet' as t1 on t0."chem_code" = t1."chem_code" WHERE t1."chemname" = 'SULFUR' GROUP BY t0."county_cd";