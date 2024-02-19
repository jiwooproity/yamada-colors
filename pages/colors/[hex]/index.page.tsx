import { defaultTheme } from "@yamada-ui/react"
import * as c from "color2k"
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next"
import { A11y } from "./a11y"
import { Data } from "./data"
import { Gradients } from "./gradients"
import { Header } from "./header"
import { Others } from "./others"
import { useHistory } from "./use-history"
import { useI18n } from "contexts/i18n-context"
import { AppLayout } from "layouts/app-layout"
import {
  darken,
  tone,
  lighten,
  toCielab,
  toCielch,
  toCmyk,
  toHsl,
  toHsv,
  toRgb,
  hue,
  complementary,
  alternative,
  triadic,
  square,
  splitComplementary,
  readability,
  isReadable,
  blindness,
} from "utils/color"
import { getColorName } from "utils/color-name-list"
import { getServerSideCommonProps } from "utils/next"

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>

export type ColorData = PageProps["data"]

const Page: NextPage<PageProps> = ({
  cookies,
  hex,
  name,
  data,
  shadeColors,
  tintColors,
  toneColors,
  complementaryColors,
  hueColors,
  alternativeColors,
  triadicColors,
  squareColors,
  splitComplementaryColors,
  blind,
  contrast,
}) => {
  useHistory({ cookies, hex })
  const { t } = useI18n()

  return (
    <AppLayout
      title={hex}
      description={t("colors.description")}
      hex={hex}
      gap={{ base: "lg", sm: "normal" }}
    >
      <Header {...{ hex, name }} />
      <Data {...data} />
      <Gradients {...{ hex, shadeColors, tintColors, toneColors }} />
      <A11y {...{ hex, blind, contrast }} />
      <Others
        {...{
          hex,
          complementaryColors,
          hueColors,
          alternativeColors,
          triadicColors,
          squareColors,
          splitComplementaryColors,
        }}
      />
    </AppLayout>
  )
}

export default Page

const getColorData = (hex: string) => {
  const name = getColorName(hex)
  const rgb = toRgb(hex)
  const hsl = toHsl(hex)
  const hsv = toHsv(hex)
  const cmyk = toCmyk(hex)
  const cielab = toCielab(hex)
  const cielch = toCielch(hex)

  return { name, hex, rgb, hsl, hsv, cmyk, cielab, cielch }
}

const getShadeColors = (hex: string) => {
  const hexes = darken(hex)

  const colors = hexes.map((hex) => ({ hex, name: getColorName(hex) }))

  return colors
}

const getTintColors = (hex: string) => {
  const hexes = lighten(hex)

  const colors = hexes.map((hex) => ({ hex, name: getColorName(hex) }))

  return colors
}

const getToneColors = (hex: string) => {
  const hexes = tone(hex)

  const colors = hexes.map((hex) => ({ hex, name: getColorName(hex) }))

  return colors
}

const getContrast = (hex: string) => {
  const { white, black } = defaultTheme.colors

  return {
    white: {
      score: readability(hex, white),
      small: isReadable(hex, white, { level: "AA", size: "small" }),
      large: isReadable(hex, white, { level: "AA", size: "large" }),
    },
    black: {
      score: readability(hex, black),
      small: isReadable(hex, black, { level: "AA", size: "small" }),
      large: isReadable(hex, black, { level: "AA", size: "large" }),
    },
  }
}

export const getServerSideProps = async (req: GetServerSidePropsContext) => {
  const {
    props: { cookies },
  } = await getServerSideCommonProps(req)
  let hex = `#${req.query.hex}` as string

  try {
    hex = c.toHex(hex)

    const data = getColorData(hex)

    const { name } = data

    const shadeColors = getShadeColors(hex)
    const tintColors = getTintColors(hex)
    const toneColors = getToneColors(hex)
    const complementaryColors = complementary(hex)
    const hueColors = hue(hex)
    const alternativeColors = alternative(hex)
    const triadicColors = triadic(hex)
    const squareColors = square(hex)
    const splitComplementaryColors = splitComplementary(hex)
    const blind = blindness(hex)
    const contrast = getContrast(hex)

    const props = {
      cookies,
      name,
      hex,
      data,
      shadeColors,
      tintColors,
      toneColors,
      complementaryColors,
      hueColors,
      alternativeColors,
      triadicColors,
      squareColors,
      splitComplementaryColors,
      blind,
      contrast,
    }

    return { props }
  } catch {
    return { notFound: true }
  }
}
