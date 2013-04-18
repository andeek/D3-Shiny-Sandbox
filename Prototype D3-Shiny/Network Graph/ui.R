dynGraph <- function(outputId) 
{
  #HTML(paste("<div id=\"", outputId, "\" class=\"shiny-graph-output\"><svg /></div>", sep=""))
  div(id = outputId, class="d3graph")
}

#dynSummary <- function(outputId)
#{
#  div(id = outputId, class="shiny-summary-output summary", style="display:none;", tag("p",textOutput("d3summary")))
#}

shinyUI(pageWithSidebar(
  
  headerPanel("Interactive Graph"),
  
  sidebarPanel(
    uiOutput("choose_dataset"),    
    uiOutput("choose_layout"),
    helpText(HTML("All source available on <a href = \"https://github.com/andeek/Community-Detection/tree/master/Prototype%20D3-Shiny/Network%20Graph\" target=\"_blank\">Github</a>"))
  ),
  
  mainPanel(
    includeHTML("scripts/graph.js"),
    dynGraph(outputId = 'd3output'),
    tableOutput('d3summary')
  )
))
