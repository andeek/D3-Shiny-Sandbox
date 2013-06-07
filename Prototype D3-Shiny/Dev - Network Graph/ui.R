dynGraph <- function(inputoutputId) 
{
  div(id = inputoutputId, class="d3graph")
}

shinyUI(pageWithSidebar(
  
  headerPanel("Interactive Graph"),
  
  sidebarPanel(
    uiOutput("choose_dataset"),    
    #uiOutput("choose_layout"),
    p("User Selection"),
    tableOutput('d3summary'),
    helpText(HTML("All source available on <a href = \"https://github.com/andeek/Community-Detection/tree/master/Prototype%20D3-Shiny/Network%20Graph\" target=\"_blank\">Github</a>"))
  ),
  
  mainPanel(
    includeHTML("scripts/graph_2.js"),
    dynGraph(inputoutputId = 'd3io')
  )
))
