import React from 'react'
import { ReactComponent as PublishIcon } from '../../../assets/publish.svg'
import { ReactComponent as CombineIcon } from '../../../assets/combine.svg'
import { ReactComponent as Group } from '../../../assets/group.svg'
import { ReactComponent as SummarizeIcon } from '../../../assets/summarize.svg'
import { Card, CardActions, CardContent, Stack } from '@mui/material'
import { ButtonPrimary as Button } from '@webiny/ui/Button'
import { Typography } from '@webiny/ui/Typography'

// import { ReactComponent as Geo } from '../../../assets/geo.svg'

type dataViewPresetInfo = {
  name: string
  description: string
  cta: string
  icon: React.FC
  id: string
}

export const dataViewTemplates: Array<dataViewPresetInfo> = [
  {
    name: 'Pubish',
    description: `Publish part or all of a data source. \n You can share this view directly, or is it in other data views.`,
    cta: 'Publish Data View',
    icon: PublishIcon,
    id: 'publish'
  },
  {
    name: 'Combine',
    description: `Bring together multiple data sources or data views, for example ZIP-code demographic data and your own data with a ZIP-code column.`,
    cta: 'Combine New Data',
    icon: CombineIcon,
    id: 'combine'
  },
  {
    name: 'Group',
    description: `Group or aggregate data based on a common value, like a state name, neighborhood, or zip code.`,
    cta: 'Create New Data Group',
    icon: Group,
    id: 'groupBy'
  },
  {
    name: 'Summarize',
    description: `Find data insights that help explain patterns in the data, common key statistics, and share indicators.`,
    cta: 'Summarize Data',
    icon: SummarizeIcon,
    id: 'summarize'
  }
]

export type DataTemplateProps = dataViewPresetInfo & {
  onChange: (id: string) => void
}

export const DataTemplate = (props: DataTemplateProps) => {
  const { name, description, cta, icon: Icon, id, onChange } = props
  return (
    <Stack direction="column" height="100%" width="100%">
      <Card key={id} sx={{ pb: 4, pt: 2 }}>
        <CardContent>
          <Stack alignItems="center" spacing={1}>
            <Icon />
            <Typography use="headline4" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {name}
            </Typography>
            <Typography use="body1" style={{ textAlign: 'center' }}>
              {description}
            </Typography>
          </Stack>
        </CardContent>
        <CardActions>
          <Button onClick={() => onChange(id)} style={{ margin: '0 auto' }}>
            {cta}
          </Button>
        </CardActions>
      </Card>
    </Stack>
  )
}

export const DataViewTemplates = ({
  setDataViewTemplate
}: {
  setDataViewTemplate: (id: string) => void
}) => {
  return (
    <Stack direction="row" spacing={2} paddingX={10} justifyContent="space-between">
      {dataViewTemplates.map((template, i) => (
        <div key={i} style={{ maxWidth: `${100 / dataViewTemplates.length}%`, height: '100%' }}>
          <DataTemplate key={i} {...template} onChange={setDataViewTemplate} />
        </div>
      ))}
    </Stack>
  )
}
