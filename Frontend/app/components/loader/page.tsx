import { Loader } from '@/app/components/loader/Loader'
import Block from '@/app/components/orbit-site/Block'
import Inset from '@/app/components/orbit-site/Inset'
import Section from '@/app/components/orbit-site/Section'

// docs:
// defaults to 24px size, use size prop to customize
//

export default function Page() {
  return (
    <Section>
      <Inset>
        <Block title="Loader">
          <Loader size={40} />
        </Block>
      </Inset>
    </Section>
  )
}
